import React, { useState, useContext } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./KanbanBoard.css"; 

const KanbanBoard = () => {
  const { tasks, updateTaskStatus } = useContext(ProjectContext); 
  const [statuses, setStatuses] = useState(["To Do", "In Progress", "Done"]);

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return; 

    if (source.droppableId !== destination.droppableId) {
      const task = tasks.find((task) => task.id === result.draggableId);
      updateTaskStatus(task.id, destination.droppableId);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        {statuses.map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-gray-100 p-4 rounded-lg"
              >
                <h2 className="text-lg font-semibold mb-4">{status}</h2>
                {tasks
                  .filter((task) => task.status === status)
                  .map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 mb-2 rounded shadow"
                        >
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-600">
                            {task.description}
                          </p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
