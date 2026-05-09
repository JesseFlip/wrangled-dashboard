import React from 'react';
import { useData } from "../../context/DataContext";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import type { PrepTask, TaskStatus } from "../../types";
import { CheckCircle2, Circle, Clock, User, Plus } from "lucide-react";
import { Button } from "../ui/button";

export const PrepSection: React.FC = () => {
  const { data, updateTask } = useData();

  const statuses: TaskStatus[] = ['todo', 'doing', 'done'];
  
  const statusLabels: Record<TaskStatus, string> = {
    todo: "To Do",
    doing: "In Progress",
    done: "Completed"
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'doing': return <Clock className="w-5 h-5 text-mustard animate-pulse" />;
      default: return <Circle className="w-5 h-5 text-slate-300" />;
    }
  };

  const toggleTask = (task: PrepTask) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      'todo': 'doing',
      'doing': 'done',
      'done': 'todo'
    };
    updateTask({ ...task, status: nextStatus[task.status] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Preparation Tasks</h2>
          <p className="text-sm text-slate-500">Checklist for a smooth party day</p>
        </div>
        <Button className="bg-teal-600 gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map(status => {
          const tasks = data.tasks.filter(t => t.status === status);
          
          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">{statusLabels[status]}</h3>
                <Badge variant="secondary" className="text-[10px]">{tasks.length}</Badge>
              </div>

              <div className="space-y-3">
                {tasks.length > 0 ? tasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className={`border-slate-200 shadow-sm cursor-pointer transition-all hover:border-teal-200 ${task.status === 'done' ? 'bg-slate-50/50' : 'bg-white'}`}
                    onClick={() => toggleTask(task)}
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getStatusIcon(task.status)}</div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {task.owner}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.dueDate}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-12 border-2 border-dashed border-slate-50 rounded-xl">
                    <p className="text-xs text-slate-300 italic">No tasks here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
