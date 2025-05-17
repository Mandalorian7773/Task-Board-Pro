const Project = require('../Models/project.model.js');


const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects', error });
    }
};


const createProject = async (req, res) => {
    try {
        const { title, description, status, dueDate, teamMembers } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'Title and description are required' });
        }

        const newProject = new Project({
            title,
            description,
            status,
            dueDate,
            teamMembers,
        });

        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(500).json({ message: 'Error creating project', error });
    }
};

const getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching the project', error });
    }
};




module.exports = {
    getAllProjects,
    createProject,
    getProjectById,
};
