document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Element References ---
    const projectListContainer = document.getElementById('project-list');
    const addProjectBtn = document.getElementById('add-project-btn');
    
    // --- 2. Data Structure ---
    let projectsData = []; 
    const generateUniqueId = () => Date.now() + Math.floor(Math.random() * 1000); 

    // --- 3. Initial Sample Data (for demonstration) ---
    const initialSampleData = [
        {
            id: generateUniqueId(),
            name: "DSP/CV Group Project",
            weeks: [
                {
                    number: 12,
                    dates: "Oct 20 - Oct 26",
                    categories: [
                        {
                            name: "Emerging Tech",
                            tasks: [
                                { id: generateUniqueId() + 1, description: "Ordered selfie stick", completed: true },
                                { id: generateUniqueId() + 2, description: "TRAINING FOR CV MODELS!!", completed: false }
                            ]
                        },
                        {
                            name: "DSP LAB",
                            tasks: [
                                { id: generateUniqueId() + 3, description: "2ND PHASE OF DSP PROJECT (Wiener, Spectral, Hybrid)", completed: false },
                                { id: generateUniqueId() + 4, description: "PROJECT PROGRESS REPORT (NOV 4)", completed: false }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    // --- 4. Persistence Functions (Save/Load) ---
    
    const saveData = () => {
        try {
            localStorage.setItem('projectTrackerData', JSON.stringify(projectsData));
        } catch (e) {
            console.error("Error saving data to localStorage:", e);
        }
    };

    const loadData = () => {
        const storedData = localStorage.getItem('projectTrackerData');
        if (storedData) {
            projectsData = JSON.parse(storedData);
        } else {
            projectsData = initialSampleData;
            saveData(); 
        }
        renderProjects();
    };

    // --- 5. Data Manipulation Functions ---

    const toggleTaskCompletion = (taskId) => {
        // Find the project, week, category, and task by iterating through the structure
        for (const project of projectsData) {
            for (const week of project.weeks) {
                for (const category of week.categories) {
                    const task = category.tasks.find(t => t.id == taskId);
                    if (task) {
                        task.completed = !task.completed;
                        saveData();
                        // No need to re-render everything; we just update the specific element
                        return; 
                    }
                }
            }
        }
    };

    const addProject = (projectName) => {
        const newProject = {
            id: generateUniqueId(),
            name: projectName,
            weeks: [
                // Start every new project with a default Week 1
                {
                    number: 1,
                    dates: "Start Date - End Date",
                    categories: [
                        // Start every new project with a default "Tasks" category
                        {
                            name: "General Tasks",
                            tasks: []
                        }
                    ]
                }
            ]
        };

        projectsData.push(newProject);
        saveData(); // Save the new project
        renderProjects(); // Update the UI
    };

    // Helper function to locate the specific category array for a new task
    const findParentContainer = (projectId, categoryName) => {
        const project = projectsData.find(p => p.id == projectId);
        if (!project) return null;

        // Find the LATEST week in the project to add the task to.
        // (You might modify this logic later if you want to select a specific week)
        const latestWeek = project.weeks[project.weeks.length - 1]; 
        if (!latestWeek) return null;

        const category = latestWeek.categories.find(c => c.name === categoryName);
        if (category) {
            return category.tasks; // Returns a reference to the tasks array
        }
        return null;
    };

    const addTask = (projectId, categoryName, description) => {
        const tasksArray = findParentContainer(projectId, categoryName);

        if (tasksArray) {
            const newTask = {
                id: generateUniqueId(),
                description: description,
                completed: false
            };
            
            tasksArray.push(newTask);
            saveData(); // Save the new data
            renderProjects(); // Re-render the UI to display the new task
        } else {
            console.error(`Could not find category: ${categoryName} in project ID: ${projectId}`);
        }
    };

    const addWeek = (projectId, dates) => {
        const project = projectsData.find(p => p.id == projectId);
        
        if (project) {
            // Determine the new week number based on the last week in the array
            const newWeekNumber = project.weeks.length > 0 
                                  ? project.weeks[project.weeks.length - 1].number + 1
                                  : 1;

            const newWeek = {
                number: newWeekNumber,
                dates: dates,
                categories: [
                    // Start every new week with a default "Tasks" category
                    {
                        name: "New Week Tasks",
                        tasks: []
                    }
                ]
            };

            project.weeks.push(newWeek);
            saveData(); // Save the updated data
            renderProjects(); // Re-render the UI to display the new week
        } else {
            console.error(`Could not find project ID: ${projectId} to add week.`);
        }
    };

    const addCategory = (projectId, weekNumber, categoryName) => {
        const project = projectsData.find(p => p.id == projectId);
        
        if (project) {
            // Find the specific week within the project
            const week = project.weeks.find(w => w.number == weekNumber);

            if (week) {
                const newCategory = {
                    name: categoryName,
                    tasks: [] // Start with an empty list of tasks
                };

                // Add the new category to the week's categories array
                week.categories.push(newCategory);
                
                saveData(); // Save the updated data
                renderProjects(); // Re-render the UI
            } else {
                console.error(`Could not find week ${weekNumber} in project ID: ${projectId}.`);
            }
        } else {
            console.error(`Could not find project ID: ${projectId} to add category.`);
        }
    };


    // --- 6. HTML Rendering Helper Functions ---

    const createTaskHTML = (task) => `
        <li class="task-item">
            <input type="checkbox" id="task-${task.id}" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
            <label for="task-${task.id}">${task.description}</label>
        </li>
    `;

    const createCategoryHTML = (category) => `
        <div class="task-category-group">
            <span class="category-name">// ${category.name}</span>
            <ul class="tasks">
                ${category.tasks.map(createTaskHTML).join('')}
            </ul>
            <button class="add-task-btn" data-category-name="${category.name}">Add Task</button>
        </div>
    `;

    const createWeekHTML = (week, projectId) => ` 
        <li class="week-item" data-week-num="${week.number}">
            <h3>week ${week.number} (${week.dates})</h3>
            ${week.categories.map(createCategoryHTML).join('')}
            
            <button class="add-category-btn" data-project-id="${projectId}" data-week-num="${week.number}">
                + Add Category
            </button>
        </li>
    `;
    
    // NOTE: We now need to pass the project.id to createWeekHTML!
    const createProjectHTML = (project) => `
        <div class="project-card" data-project-id="${project.id}">
            <h2>Project: ${project.name}</h2>
            <hr>
            <ul class="week-list">
                ${project.weeks.map(week => createWeekHTML(week, project.id)).join('')} 
            </ul>
            <button class="add-week-btn" data-project-id="${project.id}">Add New Week</button>
        </div>
    `;


    // --- 7. Main Rendering Function ---

    const renderProjects = () => {
        // Clear the existing content
        projectListContainer.innerHTML = ''; 

        if (projectsData.length === 0) {
            projectListContainer.innerHTML = '<p style="color: #999;">No projects yet. Click "Add New Project" to begin!</p>';
        } else {
            const projectsHTML = projectsData.map(createProjectHTML).join('');
            projectListContainer.innerHTML = projectsHTML;
        }

        // Attach event listeners after rendering is complete
        attachEventListeners();
    };

    // --- 8. Event Listener Setup ---

    const attachEventListeners = () => {
        // 8a. Task Completion Toggler
        const checkboxes = projectListContainer.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                // Update the data structure and save
                toggleTaskCompletion(taskId); 
                
                // For a minor visual update: simply toggle the class/style immediately
                const label = e.target.nextElementSibling;
                if (e.target.checked) {
                    label.style.textDecoration = 'line-through';
                    label.style.color = '#808080';
                } else {
                    label.style.textDecoration = 'none';
                    label.style.color = '#9cdcfe';
                }
            });
        });

        // 8b. Listener for the global "Add New Project" button
        addProjectBtn.onclick = () => {
            const projectName = prompt("Enter the name for the new project:");
            if (projectName && projectName.trim() !== '') {
                addProject(projectName.trim());
            } else if (projectName !== null) {
                alert("Project name cannot be empty.");
            }
        };

        // 8c. Listeners for Add Week/Add Task buttons 
        projectListContainer.querySelectorAll('.add-week-btn').forEach(btn => {
            btn.onclick = () => {
                const projectId = btn.getAttribute('data-project-id');
                const weekDates = prompt("Enter the date range for the new week (e.g., Nov 10 - Nov 16):");
                
                if (weekDates && weekDates.trim() !== '') {
                    addWeek(projectId, weekDates.trim());
                } else if (weekDates !== null) {
                    alert("Week date range cannot be empty.");
                }
            };
        });

        projectListContainer.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.onclick = () => {
                const categoryName = btn.getAttribute('data-category-name');
                
                // Traverse up the DOM to find the parent project card's ID
                const projectCard = btn.closest('.project-card');
                const projectId = projectCard ? projectCard.getAttribute('data-project-id') : null;

                if (!projectId) {
                    console.error("Could not find parent project ID for adding task.");
                    return;
                }

                const taskDesc = prompt(`Enter new task for Category: ${categoryName}:`);
                
                if (taskDesc && taskDesc.trim() !== '') {
                    addTask(projectId, categoryName, taskDesc.trim());
                } else if (taskDesc !== null) {
                    alert("Task description cannot be empty.");
                }
            };
        });

        // NEW: Listener for Add Category buttons
        projectListContainer.querySelectorAll('.add-category-btn').forEach(btn => {
            btn.onclick = () => {
                const projectId = btn.getAttribute('data-project-id');
                const weekNumber = btn.getAttribute('data-week-num');
                
                const categoryName = prompt(`Enter name for new category in Week ${weekNumber}:`);
                
                if (categoryName && categoryName.trim() !== '') {
                    addCategory(projectId, weekNumber, categoryName.trim());
                } else if (categoryName !== null) {
                    alert("Category name cannot be empty.");
                }
            };
        });
    };
    
    // --- 9. Initialize the App ---
    loadData();
});