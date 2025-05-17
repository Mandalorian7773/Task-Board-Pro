const express = require('express');
const router = express.Router();
const Task = require('../Models/task.model');
const Project = require('../Models/project.model');
const User = require('../Models/user.model');
const { verifyToken } = require('../middleware/auth.middleware');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        console.log('Checking admin status for user:', req.user);
        console.log('Request body:', req.body);
        
        if (!req.user || !req.user.uid) {
            console.error('User not authenticated:', req.user);
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!req.body.project) {
            console.error('Project ID not provided in request body');
            return res.status(400).json({ message: 'Project ID is required' });
        }

        // Find project and populate admin field
        const project = await Project.findById(req.body.project).populate('admin');
        console.log('Found project:', JSON.stringify(project, null, 2));
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (!project.admin) {
            console.error('Project has no admin:', project);
            return res.status(500).json({ message: 'Project has no admin assigned' });
        }

        // Check if user is admin by comparing firebaseUid
        const isAdmin = project.admin.firebaseUid === req.user.uid;
        console.log('Admin check:', {
            projectAdminFirebaseUid: project.admin.firebaseUid,
            userFirebaseUid: req.user.uid,
            isAdmin
        });

        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admin can perform this action' });
        }
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create a new task (admin only)
router.post('/', verifyToken, isAdmin, async (req, res) => {
    try {
        console.log('Creating new task with data:', req.body);
        const { title, description, priority, project, assignedTo, dueDate, status } = req.body;
        
        if (!title || !description || !priority || !project) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: { title: !title, description: !description, priority: !priority, project: !project }
            });
        }

        // Get user from database using firebaseUid
        const user = await User.findOne({ firebaseUid: req.user.uid });
        console.log('Found user for task creation:', JSON.stringify(user, null, 2));
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const task = new Task({
            title,
            description,
            priority,
            project,
            assignedTo,
            createdBy: user._id,
            dueDate,
            status: status || 'pending'
        });

        console.log('Created task object:', JSON.stringify(task, null, 2));
        const savedTask = await task.save();
        console.log('Saved task:', JSON.stringify(savedTask, null, 2));
        
        // Populate the task with user details
        const populatedTask = await Task.findById(savedTask._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');
            
        console.log('Populated task:', JSON.stringify(populatedTask, null, 2));
        res.status(201).json(populatedTask);
    } catch (error) {
        console.error('Task creation error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get all tasks for a project
router.get('/project/:projectId', verifyToken, async (req, res) => {
    try {
        console.log('Fetching tasks for project:', req.params.projectId);
        console.log('User making request:', req.user);

        const tasks = await Task.find({ project: req.params.projectId })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');
            
        console.log('Found tasks:', JSON.stringify(tasks, null, 2));
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get tasks assigned to a user
router.get('/assigned', verifyToken, async (req, res) => {
    try {
        // Get user from database using firebaseUid
        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const tasks = await Task.find({ assignedTo: user._id })
            .populate('project', 'title')
            .populate('createdBy', 'name email');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update task status
router.patch('/:taskId/status', verifyToken, async (req, res) => {
    try {
        // Get user from database using firebaseUid
        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.assignedTo.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        task.status = req.body.status;
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update task (admin only)
router.put('/:taskId', verifyToken, isAdmin, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        Object.assign(task, req.body);
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete task (admin only)
router.delete('/:taskId', verifyToken, isAdmin, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.remove();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 