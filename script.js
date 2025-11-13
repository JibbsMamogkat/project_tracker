document.addEventListener('DOMContentLoaded', () => {
    // 1. Get references to key DOM elements
    const projectListContainer = document.getElementById('project-list');
    const addProjectBtn = document.getElementById('add-project-btn');
    
    // 2. Initial Data Structure (we'll start with an empty array)
    let projectsData = []; // This will hold all your project data objects

    // 3. Functions to manage data persistence
    const loadData = () => {
        // Try to load data from localStorage, otherwise use an empty array
        const storedData = localStorage.getItem('projectTrackerData');
        if (storedData) {
            projectsData = JSON.parse(storedData);
        } else {
            // For the first load, you could populate with some initial data 
            // or just leave it empty. We'll leave it empty for now.
        }
        renderProjects();
    };

    const saveData = () => {
        localStorage.setItem('projectTrackerData', JSON.stringify(projectsData));
    };

    // 4. Function to render/draw the HTML based on the data
    const renderProjects = () => {
        // This function will be complex! 
        // For now, we'll just log a message.
        // Later, it will clear projectListContainer and re-draw everything.
        // console.log("Rendering projects from data:", projectsData);

        // For now, let's just make the existing checkboxes interactive
        attachEventListeners(); 
    };

    // 5. Function to attach event listeners to dynamic elements (like checkboxes)
    const attachEventListeners = () => {
        const checkboxes = projectListContainer.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            // Only attach an event listener if one hasn't been attached already
            if (!checkbox.hasAttribute('data-listener-attached')) {
                checkbox.addEventListener('change', (e) => {
                    // This is where you'd update your projectsData 
                    // and then call saveData()
                    console.log(`Task ${e.target.id} status changed to: ${e.target.checked}`);
                });
                checkbox.setAttribute('data-listener-attached', 'true');
            }
        });

        // Add event listeners for the 'Add Task' and 'Add Week' buttons here too
        // ...
    };

    // 6. Function to handle adding a new project
    addProjectBtn.addEventListener('click', () => {
        const projectName = prompt("Enter the name for the new project:");
        if (projectName) {
            // Logic to create a new project object and push it to projectsData
            // projectsData.push({...});
            // saveData();
            // renderProjects();
            alert(`Project "${projectName}" would be created now!`);
        }
    });

    // Load data and render on startup
    loadData();
});