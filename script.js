document.addEventListener('DOMContentLoaded', () => {
    // --- 1. DOM Element References ---
    const projectListContainer = document.getElementById('project-list');
    const addProjectBtn = document.getElementById('add-project-btn');
    
    // --- 2. Data Structure ---
    let projectsData = []; 
    const generateUniqueId = () => Date.now() + Math.floor(Math.random() * 1000); 
    // NEW: Variable to track which project is currently displayed
    let activeProjectId = null;

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

    const deleteTask = (taskId) => {
        // Find the task and the array it belongs to
        let found = false;
        for (const project of projectsData) {
            for (let i = 0; i < project.weeks.length; i++) {
                const week = project.weeks[i];
                for (let j = 0; j < week.categories.length; j++) {
                    const category = week.categories[j];
                    
                    // Find the index of the task to delete
                    const taskIndex = category.tasks.findIndex(t => t.id == taskId);
                    
                    if (taskIndex !== -1) {
                        // Use splice to remove the task from its array
                        category.tasks.splice(taskIndex, 1);
                        found = true;
                        break; 
                    }
                }
                if (found) break;
            }
            if (found) break;
        }

        if (found) {
            saveData(); 
            renderProjects(); // Re-render the UI to reflect the removal
        } else {
            console.error(`Task ID ${taskId} not found.`);
        }
    };

    const deleteCategory = (projectId, weekNumber, categoryName) => {
        const project = projectsData.find(p => p.id == projectId);
        if (!project) return;
        
        const week = project.weeks.find(w => w.number == weekNumber);
        if (!week) return;

        // Filter the categories array, keeping only those whose name DOES NOT match
        const initialLength = week.categories.length;
        week.categories = week.categories.filter(c => c.name !== categoryName);

        if (week.categories.length < initialLength) {
            saveData();
            renderProjects();
        } else {
            console.error(`Category ${categoryName} not found in Week ${weekNumber}.`);
        }
    };

    const deleteWeek = (projectId, weekNumber) => {
        const project = projectsData.find(p => p.id == projectId);
        if (!project) return;
        
        // Filter the weeks array, keeping only those whose number DOES NOT match
        const initialLength = project.weeks.length;
        project.weeks = project.weeks.filter(w => w.number != weekNumber);

        if (project.weeks.length < initialLength) {
            saveData();
            renderProjects();
        } else {
            console.error(`Week ${weekNumber} not found in Project ID ${projectId}.`);
        }
    };

    const deleteProject = (projectId) => {
        // Filter the main projectsData array, keeping only projects whose ID DOES NOT match
        const initialLength = projectsData.length;
        projectsData = projectsData.filter(p => p.id != projectId);

        if (projectsData.length < initialLength) {
            saveData();
            renderProjects();
        } else {
            console.error(`Project ID ${projectId} not found.`);
        }
    };

    const updateName = (type, id, newName) => {
        let found = false;
        
        // Handle Project update
        if (type === 'project') {
            const project = projectsData.find(p => p.id == id);
            if (project) {
                project.name = newName;
                found = true;
            }
        } 
        
        // Handle Task update
        else if (type === 'task') {
            // Reusing logic from deleteTask to find the task
            for (const project of projectsData) {
                for (const week of project.weeks) {
                    for (const category of week.categories) {
                        const task = category.tasks.find(t => t.id == id);
                        if (task) {
                            task.description = newName;
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                if (found) break;
            }
        } 
        
        // Handle Week and Category updates (more complex ID format: projectId_weekNum_categoryName)
        else if (type === 'week' || type === 'category') {
            const parts = id.split('_');
            const projectId = parts[0];
            const weekNumber = parseInt(parts[1]);
            const project = projectsData.find(p => p.id == projectId);

            if (project) {
                const week = project.weeks.find(w => w.number === weekNumber);
                if (week) {
                    if (type === 'week') {
                        week.dates = newName;
                        found = true;
                    } else if (type === 'category' && parts[2]) {
                        const oldCategoryName = parts[2];
                        const category = week.categories.find(c => c.name === oldCategoryName);
                        if (category) {
                            category.name = newName;
                            found = true;
                        }
                    }
                }
            }
        }

        if (found) {
            saveData();
            // No need to re-render; the DOM update is handled locally by the event listener
        } else {
            console.error(`Could not update name for type ${type} with ID ${id}`);
        }
    };

    // --- Tab Management Functions ---

// Function to render the HTML tabs
    const renderTabs = () => {
        const tabBar = document.getElementById('tab-bar');
        tabBar.innerHTML = ''; // Clear existing tabs

        if (projectsData.length === 0) return;

        projectsData.forEach((project) => { // Removed index here, unnecessary
            const tabButton = document.createElement('button');
            tabButton.classList.add('tab-btn');
            tabButton.textContent = project.name;
            tabButton.setAttribute('data-project-id', project.id);
            
            // Check against the stored activeProjectId
            if (project.id == activeProjectId) { 
                tabButton.classList.add('active');
            }

            tabButton.addEventListener('click', () => {
                switchTab(project.id);
            });
            tabBar.appendChild(tabButton);
        });
    };

    // Function to handle switching project visibility
    const switchTab = (projectId) => {
        // 1. NEW: Store the active project ID
        activeProjectId = projectId; 

        // 2. Update the tabs (visual style)
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            // Compare string IDs using == (since data-project-id is a string)
            if (btn.getAttribute('data-project-id') == projectId) { 
                btn.classList.add('active');
            }
        });

        // 3. Update the project content (visibility)
        document.querySelectorAll('.project-card').forEach(card => {
            card.style.display = 'none';
            if (card.getAttribute('data-project-id') == projectId) {
                card.style.display = 'block'; // Show the selected project
            }
        });
    };


    // --- 6. HTML Rendering Helper Functions ---

    const createTaskHTML = (task) => `
        <li class="task-item">
            <div class="task-content">
                <input type="checkbox" id="task-${task.id}" data-task-id="${task.id}" ${task.completed ? 'checked' : ''}>
                <label for="task-${task.id}">
                    <span class="editable-name" data-id="${task.id}" data-type="task">${task.description}</span>
                </label>
            </div>
            <button class="delete-btn delete-task-btn" data-task-id="${task.id}">x</button> 
        </li>
    `;

    const createCategoryHTML = (category, projectId, weekNumber) => ` 
        <div class="task-category-group">
            <span class="category-name">
                // 
                <span class="editable-name" data-id="${projectId}_${weekNumber}_${category.name}" data-type="category">${category.name}</span>
                <button 
                    class="delete-btn delete-category-btn" 
                    data-project-id="${projectId}"
                    data-week-num="${weekNumber}"
                    data-category-name="${category.name}"
                >
                    x
                </button>
            </span>
            <ul class="tasks">
                ${category.tasks.map(createTaskHTML).join('')}
            </ul>
            <button class="add-task-btn" data-category-name="${category.name}">Add Task</button>
        </div>
    `;

    const createWeekHTML = (week, projectId) => ` 
        <li class="week-item" data-week-num="${week.number}">
            <h3>
                week ${week.number} 
                <span class="editable-name" data-id="${projectId}_${week.number}" data-type="week">(${week.dates})</span>
                <button 
                    class="delete-btn delete-week-btn" 
                    data-project-id="${projectId}" 
                    data-week-num="${week.number}"
                >
                    x
                </button>
            </h3>
            ${week.categories.map(category => createCategoryHTML(category, projectId, week.number)).join('')}
            
            <button class="add-category-btn" data-project-id="${projectId}" data-week-num="${week.number}">
                + Add Category
            </button>
        </li>
    `;
    
    const createProjectHTML = (project) => `
        <div class="project-card" data-project-id="${project.id}">
            <h2>
                Project: 
                <span class="editable-name" data-id="${project.id}" data-type="project">${project.name}</span>
                <button class="delete-btn delete-project-btn" data-project-id="${project.id}">x</button>
            </h2>
            <hr>
            <ul class="week-list">
                ${project.weeks.map(week => createWeekHTML(week, project.id)).join('')} 
            </ul>
            <button class="add-week-btn" data-project-id="${project.id}">Add New Week</button>
        </div>
    `;
    // --- 7. Main Rendering Function ---

    const renderProjects = () => {
        // 1. Clear the existing content
        projectListContainer.innerHTML = ''; 

        if (projectsData.length === 0) {
            projectListContainer.innerHTML = '<p style="color: #999;">No projects yet. Click "Add New Project" to begin!</p>';
            renderTabs(); // Still render tabs to clear any old ones
            return;
        }

        // 2. Generate Project Cards HTML
        const projectsHTML = projectsData.map(createProjectHTML).join('');
        projectListContainer.innerHTML = projectsHTML;
        
        // 3. Render and Manage Tabs
        renderTabs();

        // 4. Set Initial View (show the first project)
        // If activeProjectId is null (first load), default to the first project
        const projectIdToShow = activeProjectId || projectsData[0].id; 
        switchTab(projectIdToShow);

        // 5. Attach Event Listeners
        attachEventListeners();
    };

    // --- 8. Event Listener Setup ---
    // Function to initiate edit mode
    const activateEditMode = (element) => {
        const currentText = element.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText.trim();
        input.classList.add('editable-name-input');

        const calculatedWidth = Math.max(element.offsetWidth * 1.1, 150); // Use 150px as a backup width
        input.style.width = `${calculatedWidth}px`;

        element.replaceWith(input); // Replace the span with the input field
        input.focus();

        const saveEdit = () => {
            const newName = input.value.trim();
            const elementType = element.getAttribute('data-type');
            const elementId = element.getAttribute('data-id');

            if (newName === '') {
                // If they cleared the name, restore the old one
                alert("Name cannot be empty. Reverting change.");
                input.value = currentText; 
            }
            
            // Save to data structure
            updateName(elementType, elementId, newName);
            
            // Re-insert the original span with the new text
            element.textContent = newName;
            input.replaceWith(element);
        };

        // Event: Save on loss of focus
        input.addEventListener('blur', saveEdit);
        
        // Event: Save on Enter key press
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });
    };

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

        //EDITING LISTENER!!
        // NEW: Double-click listener for all editable names
        projectListContainer.querySelectorAll('.editable-name').forEach(span => {
            // Prevent multiple listeners from being attached during re-render
            span.removeEventListener('dblclick', activateEditMode.bind(null, span)); 
            span.addEventListener('dblclick', activateEditMode.bind(null, span));
        });
        
        //DELETE LISTENERS!!
        // NEW: Listener for Delete Task buttons
        projectListContainer.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.onclick = (e) => {
                const taskId = e.target.getAttribute('data-task-id');
                if (confirm("Are you sure you want to delete this task?")) {
                    deleteTask(taskId);
                }
            };
        });
        // NEW: Listener for Delete Category buttons
        projectListContainer.querySelectorAll('.delete-category-btn').forEach(btn => {
            btn.onclick = (e) => {
                const projectId = btn.getAttribute('data-project-id');
                const weekNumber = parseInt(btn.getAttribute('data-week-num'));
                const categoryName = btn.getAttribute('data-category-name');
                
                if (confirm(`Are you sure you want to delete the category "${categoryName}" and all its tasks?`)) {
                    deleteCategory(projectId, weekNumber, categoryName);
                }
            };
        });

        // NEW: Listener for Delete Week buttons
        projectListContainer.querySelectorAll('.delete-week-btn').forEach(btn => {
            btn.onclick = (e) => {
                const projectId = btn.getAttribute('data-project-id');
                const weekNumber = parseInt(btn.getAttribute('data-week-num'));
                
                if (confirm(`WARNING: Are you sure you want to delete Week ${weekNumber} and ALL its content?`)) {
                    deleteWeek(projectId, weekNumber);
                }
            };
        });

        // NEW: Listener for Delete Project buttons
        projectListContainer.querySelectorAll('.delete-project-btn').forEach(btn => {
            btn.onclick = (e) => {
                const projectId = btn.getAttribute('data-project-id');
                
                if (confirm("🚨 WARNING: Are you sure you want to delete this ENTIRE PROJECT? All weeks, categories, and tasks will be lost.")) {
                    deleteProject(projectId);
                }
            };
        });
    };
    
    // --- 9. Initialize the App ---
    loadData();
    // After loadData, if projects exist, set the initial active ID
    if (projectsData.length > 0) {
        activeProjectId = projectsData[0].id;
    }
});