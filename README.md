# 🚀 Group Project Tracker

A minimal, hierarchical project and task checklist application built with pure HTML, CSS, and JavaScript. This tool is designed to help small groups collaboratively track progress across different projects, weeks, and technical categories.

## 🔗 Live Application

The project tracker is hosted on GitHub Pages and is live at the following URL:

[https://jibbsmamogkat.github.io/project_tracker/](https://jibbsmamogkat.github.io/project_tracker/)

---

## ✨ Features

* **Hierarchical Structure:** Organize tasks by Project → Week → Category.
* **Full CRUD:** Create, Read, Update, and Delete projects, weeks, categories, and tasks.
* **Tabbed Navigation:** Easily switch between different projects without excessive scrolling.
* **Persistence:** All data is saved directly in your browser's **Local Storage** and will be available every time you open the app.
* **Click-to-Edit:** Double-click on any Project Name, Week Date Range, Category Name, or Task Description to instantly edit the text.

---

## 🛠️ How to Use

1.  **Open the Live Link:** Navigate to the live application URL above.
2.  **Add a Project:** Click the **`+ Add New Project`** button and enter a name. A tab for the new project will appear.
3.  **Add Structure:** Use the **`+ Add Week`** and **`+ Add Category`** buttons to build out the required structure for your project.
4.  **Add Tasks:** Use the **`Add Task`** button under any category to add items to your checklist.
5.  **Edit Items:** **Double-click** any text (names or descriptions) to enter edit mode and change the content.
6.  **Mark Complete:** Check the box next to a task to mark it as completed (text will be crossed out).

---

## 💻 Technical Details

This project utilizes no external libraries or frameworks, focusing solely on fundamental web technologies to ensure speed and simplicity:

* **HTML5:** Structure
* **CSS3:** Dark-theme styling and layout
* **JavaScript (ES6):** Data management, DOM manipulation, and persistence via `localStorage`.

### Data Model

The entire application state is stored in a single JSON array structure within the browser:

```json
[
  {
    "id": 1678832000,
    "name": "Project Name",
    "weeks": [
      {
        "number": 1,
        "dates": "Date Range",
        "categories": [
          {
            "name": "Category Name",
            "tasks": [
              {
                "id": 1678832001,
                "description": "Task description",
                "completed": false
              }
            ]
          }
        ]
      }
    ]
  }
]