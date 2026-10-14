# Automation Pipeline Builder

A full-stack visual pipeline builder built with React and FastAPI. It allows users to create, configure, and connect nodes on a canvas to design and analyze workflows.

## Overview

Automation Pipeline Builder provides a visual interface for building workflows using interconnected nodes. Each node represents a component of the workflow, and connections define how the components relate to one another.

The project focuses on reusable components, dynamic text processing, consistent UI design, and frontend-backend integration.

## Features

### 1. Visual Pipeline Editor

- Create and arrange nodes on a visual canvas.
- Connect nodes using input and output handles.
- Build workflows by defining relationships between nodes.
- Configure individual nodes according to their purpose.

### 2. Reusable Node Architecture

The application uses a reusable node abstraction to simplify the creation and maintenance of different node types.

The abstraction supports configurable:

- Node titles and content
- Input and output handles
- Node dimensions and styling
- Node-specific configuration

Additional node types demonstrate how new components can be added without duplicating the same layout and structural logic.

### 3. Dynamic Text Node

The Text Node supports dynamic sizing and variable detection.

**Dynamic Sizing**

The node adjusts its dimensions according to the text entered, helping users work with both short and longer text content.

**Dynamic Variables**

Variables can be written using double curly brackets.

Example:

```text
Hello {{name}}, welcome to {{company}}!
```

The application identifies valid variable names and creates corresponding input handles on the left side of the Text Node.

This allows the node's inputs to adapt to the variables used in its text.

### 4. Multiple Node Types

The pipeline editor supports different node types for building and organizing workflows.

The node architecture is designed to make it easier to introduce new nodes with their own configuration and behavior while maintaining a consistent interface.

### 5. Backend Pipeline Analysis

The React frontend communicates with a Python FastAPI backend to analyze the current pipeline.

The API endpoint is:

```http
POST /pipelines/parse
```

The backend receives the pipeline's nodes and edges and calculates:

- **Node Count:** Total number of nodes in the pipeline.
- **Edge Count:** Total number of connections between nodes.
- **DAG Validation:** Determines whether the pipeline forms a Directed Acyclic Graph (DAG).

Example API response:

```json
{
  "num_nodes": 5,
  "num_edges": 4,
  "is_dag": true
}
```

The frontend displays the analysis results when the user submits the pipeline.

## Tech Stack

### Frontend

- React
- JavaScript
- React Flow
- CSS

### Backend

- Python
- FastAPI
- Uvicorn

### Development Tools

- Visual Studio Code
- npm
- Git and GitHub

## Project Structure

```text
AutomationPipeline/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── nodes/
│   │   ├── App.js
│   │   ├── submit.js
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## Prerequisites

Before running the project, make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [Python](https://www.python.org/) 3.10 or later
- pip

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/automation-pipeline-builder.git
cd automation-pipeline-builder
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Start the Backend

Open a terminal in the project directory and navigate to the backend:

```bash
cd backend
```

Create and activate a virtual environment if you do not already have one.

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will typically be available at:

`http://127.0.0.1:8000`

FastAPI's interactive API documentation is typically available at:

`http://127.0.0.1:8000/docs`

### 3. Start the Frontend

Open a second terminal in the project directory:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

Open the local URL displayed in the terminal to use the application.

Keep both the backend and frontend servers running while using the pipeline editor.

## How to Use

1. Launch the backend and frontend servers.
2. Open the application in your browser.
3. Add nodes to the canvas using the available controls.
4. Arrange the nodes to create your workflow.
5. Connect nodes using their input and output handles.
6. Enter text in the Text Node.
7. Try variables such as `{{name}}` or `{{company}}`.
8. Click the Submit button to analyze the pipeline.
9. Review the node count, edge count, and DAG validation result.

## Example Workflow

A simple workflow could be organized as follows:

```text
Input Node
    |
    v
Text Node
    |
    v
Processing Node
    |
    v
Output Node
```

Users can arrange and connect nodes on the canvas to represent their desired workflow. The backend analyzes the resulting graph when the pipeline is submitted.

## System Architecture

The application follows a frontend-backend architecture.

```text
          React Frontend
                |
                | Pipeline Nodes and Edges
                v
         FastAPI Endpoint
        /pipelines/parse
                |
                v
          Graph Analysis
                |
        +-------+-------+
        |       |       |
        v       v       v
     Node     Edge     DAG
     Count    Count  Validation
        |       |       |
        +-------+-------+
                |
                v
          JSON Response
                |
                v
        Frontend Results
```

## API Overview

### Parse Pipeline

**Endpoint:** `POST /pipelines/parse`

This endpoint accepts the pipeline graph and returns information about its structure.

Example request body:

```json
{
  "nodes": [],
  "edges": []
}
```

Example response:

```json
{
  "num_nodes": 5,
  "num_edges": 4,
  "is_dag": true
}
```

The actual request fields and response values depend on the pipeline submitted and the backend implementation.

## Future Improvements

Potential enhancements for the project include:

- Saving and loading workflows.
- Exporting and importing pipeline configurations.
- Adding more specialized node types.
- Improving error handling and validation.
- Displaying pipeline analysis results in a dedicated results panel.
- Supporting workflow execution and execution status tracking.
- Adding user authentication and project management.

## Contributing

Contributions and suggestions are welcome.

1. Fork the repository.
2. Create a branch for your changes.
3. Make your changes and test them.
4. Commit your changes with a descriptive message.
5. Open a pull request.

## License

A license has not yet been specified. Add a license file if you intend to distribute the project under particular usage terms.
