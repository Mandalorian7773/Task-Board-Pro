const express = require('express');
const { getAllProjects, createProject, getProjectById } = require('./../Controllers/project.controller');
const Project = require('../Models/project.model');
const User = require('../Models/user.model');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();


router.post('/create', verifyToken, async (req, res) => {
    try {
        console.log('Creating new project with data:', req.body);
        console.log('User from request:', req.user);
        
        const { title, description } = req.body;
        
        if (!title || !description) {
            console.error('Missing required fields:', { title, description });
            return res.status(400).json({ message: 'Title and description are required' });
        }
        
        if (!req.user || !req.user._id) {
            console.error('User or user._id is undefined:', req.user);
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
      
        const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        console.log('Generated invite code:', inviteCode);
        
        const project = new Project({
            title,
            description,
            admin: req.user._id,
            inviteCode,
            teamMembers: [req.user._id]
        });

        console.log('Project object before save:', project);
        
        const savedProject = await project.save();
        console.log('Project saved successfully:', savedProject);
        
       
        const populatedProject = await Project.findById(savedProject._id)
            .populate('admin', '_id name email firebaseUid')
            .populate('teamMembers', '_id name email firebaseUid');
            
        console.log('Populated project:', populatedProject);
        
        res.status(201).json(populatedProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ 
            message: 'Error creating project', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


router.post('/join', verifyToken, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const project = await Project.findOne({ inviteCode });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

      
        if (project.teamMembers.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already a member of this project' });
        }

        project.teamMembers.push(req.user._id);
        await project.save();
        
        res.json({ message: 'Successfully joined project', project });
    } catch (error) {
        console.error('Error joining project:', error);
        res.status(500).json({ message: 'Error joining project', error: error.message });
    }
});


router.get('/', verifyToken, async (req, res) => {
    try {
        console.log('User from request:', req.user);
        
        if (!req.user || !req.user._id) {
            console.error('User or user._id is undefined:', req.user);
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const userId = req.user._id;
        console.log('Fetching projects for user ID:', userId);

        const projects = await Project.find({
            $or: [
                { admin: userId },
                { teamMembers: userId }
            ]
        })
        .populate({
            path: 'admin',
            select: '_id name email firebaseUid'
        })
        .populate({
            path: 'teamMembers',
            select: '_id name email firebaseUid'
        });
        
        console.log('Found projects:', JSON.stringify(projects, null, 2));

        if (!projects) {
            console.log('No projects found, returning empty array');
            return res.status(200).json([]);
        }

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error in GET /projects:', error);
        res.status(500).json({ 
            message: 'Error fetching projects', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


router.get('/:id', verifyToken, async (req, res) => {
    try {
        console.log('Fetching project with ID:', req.params.id);
        console.log('User from request:', req.user);

        if (!req.user || !req.user._id) {
            console.error('User or user._id is undefined:', req.user);
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const project = await Project.findById(req.params.id)
            .populate('admin', '_id name email firebaseUid')
            .populate('teamMembers', '_id name email firebaseUid');
            
        if (!project) {
            console.log('Project not found with ID:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

    
        const isMember = project.teamMembers.some(member => {
            if (!member) return false;
            return (
                (member._id && member._id.toString() === req.user._id.toString()) ||
                (member.firebaseUid && member.firebaseUid === req.user.firebaseUid)
            );
        });

        const isAdmin = project.admin && (
            (project.admin._id && project.admin._id.toString() === req.user._id.toString()) ||
            (project.admin.firebaseUid && project.admin.firebaseUid === req.user.firebaseUid)
        );

        if (!isMember && !isAdmin) {
            console.log('User not authorized to view project:', {
                userId: req.user._id,
                firebaseUid: req.user.firebaseUid,
                projectId: project._id
            });
            return res.status(403).json({ message: 'Not authorized to view this project' });
        }

        console.log('Successfully fetched project:', {
            projectId: project._id,
            userId: req.user._id,
            isAdmin,
            isMember
        });
        
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ 
            message: 'Error fetching project', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


router.put('/:id', verifyToken, async (req, res) => {
    try {
        console.log('Updating project with ID:', req.params.id);
        console.log('User from request:', req.user);

        if (!req.user || !req.user._id) {
            console.error('User or user._id is undefined:', req.user);
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const project = await Project.findById(req.params.id)
            .populate('admin', '_id name email firebaseUid')
            .populate('teamMembers', '_id name email firebaseUid');
        
        if (!project) {
            console.log('Project not found with ID:', req.params.id);
            return res.status(404).json({ message: 'Project not found' });
        }

      
        if (project.admin.firebaseUid !== req.user.firebaseUid) {
            console.log('User not authorized to update project:', req.user._id);
            return res.status(403).json({ message: 'Only admin can update the project' });
        }

        const { title, description } = req.body;
        if (title) project.title = title;
        if (description) project.description = description;

        const updatedProject = await project.save();
        console.log('Project updated successfully:', updatedProject);
        
        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ 
            message: 'Error updating project', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});


router.delete('/:id/members/:memberId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only admin can remove members' });
        }

        project.teamMembers = project.teamMembers.filter(
            member => member.toString() !== req.params.memberId
        );

        await project.save();
        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.admin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only admin can delete the project' });
        }

        await project.remove();
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
