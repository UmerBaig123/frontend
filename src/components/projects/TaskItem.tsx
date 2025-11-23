 
import React, { useState } from 'react';
import { Task } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  onRemoveTask?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggleComplete = () => {}, 
  onRemoveTask = () => {} 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-3">
        <Checkbox 
          checked={task.completed} 
          onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
          className={task.completed ? 'bg-green-500 border-green-500' : ''}
        />
        <span className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </span>
      </div>
      {(isHovered || task.completed) && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
          onClick={() => onRemoveTask(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default TaskItem;
