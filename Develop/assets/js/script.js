$(document).ready(function () {
    // Define task board columns and their corresponding task lists
    let columns = {
      'not-started': [],
      'in-progress': [],
      'completed': []
    };
  
    // Function to load tasks from localStorage
    function loadTasks() {
      let savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
      // Assign tasks to appropriate columns based on their status
      savedTasks.forEach(function (task) {
        columns[task.status].push(task);
      });
  
      renderTaskBoard();
    }
  
    // Function to save tasks to localStorage
    function saveTasks() {
      let tasksToSave = [];
  
      // Convert columns object into an array of tasks
      Object.keys(columns).forEach(function (column) {
        tasksToSave = tasksToSave.concat(columns[column]);
      });
  
      localStorage.setItem('tasks', JSON.stringify(tasksToSave));
    }
  
    // Function to generate unique task ID
    function generateTaskId() {
      return '_' + Math.random().toString(36).substr(2, 9); // Example ID generation
    }
  
    // Function to create task card HTML
    function createTaskCard(task) {
      // Determine color based on due date
      let today = new Date();
      let dueDate = new Date(task.dueDate);
      let colorClass = '';
      
      if (dueDate < today) {
        colorClass = 'bg-danger'; // Overdue tasks
      } else if (dueDate.getDate() - today.getDate() <= 3) {
        colorClass = 'bg-warning'; // Tasks due within 3 days
      }
  
      return `
        <div class="card mb-3 ${colorClass}" id="${task.id}">
          <div class="card-body">
            <h5 class="card-title">${task.title}</h5>
            <p class="card-text">${task.description}</p>
            <p class="card-text"><small class="text-muted">Due Date: ${task.dueDate}</small></p>
            <button type="button" class="btn btn-danger btn-sm delete-button" data-task-id="${task.id}">Delete</button>
          </div>
        </div>
      `;
    }
  
    // Function to render the entire task board
    function renderTaskBoard() {
      Object.keys(columns).forEach(function (columnId) {
        let column = $('#' + columnId);
  
        // Clear existing cards
        column.empty();
  
        // Render each task in the column
        columns[columnId].forEach(function (task) {
          let cardHtml = createTaskCard(task);
          column.append(cardHtml);
        });
  
        // Add jQuery UI Sortable to enable drag-and-drop between columns
        column.sortable({
          connectWith: '.task-list',
          update: function (event, ui) {
            let taskId = ui.item.attr('id');
            let newColumnId = $(this).attr('id');
  
            // Update task's status based on new column
            columns[newColumnId].push(columns[columnId].find(task => task.id === taskId));
            columns[columnId] = columns[columnId].filter(task => task.id !== taskId);
  
            saveTasks();
          }
        });
      });
    }
  
    // Event listener for adding a new task
    $('#add-task-form').submit(function (event) {
      event.preventDefault();
  
      let title = $('#title').val();
      let description = $('#description').val();
      let dueDate = $('#due-date').val();
  
      let newTask = {
        id: generateTaskId(),
        title: title,
        description: description,
        dueDate: dueDate,
        status: 'not-started' // Initial status
      };
  
      columns['not-started'].push(newTask);
      saveTasks();
      renderTaskBoard();
  
      $('#formModal').modal('hide');
      $('#add-task-form')[0].reset();
    });
  
    // Event delegation for deleting a task
    $('.container').on('click', '.delete-button', function () {
      let taskId = $(this).data('task-id');
  
      Object.keys(columns).forEach(function (columnId) {
        columns[columnId] = columns[columnId].filter(task => task.id !== taskId);
      });
  
      saveTasks();
      renderTaskBoard();
    });
  
    // Load tasks on page load
    loadTasks();
  });
  