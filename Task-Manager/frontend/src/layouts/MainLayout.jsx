import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { TodoModal } from '../components/TodoModal';
import { todoService } from '../services/todoService';
import { useNotification } from '../context/NotificationContext';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showSuccess, showError } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const handleCreateTodo = async (todoData) => {
    try {
      setIsSubmitting(true);
      await todoService.createTodo(todoData);
      showSuccess('Todo created successfully');
      setIsAddModalOpen(false);

      // Dispatch custom window event so child pages can refetch seamlessly
      window.dispatchEvent(new CustomEvent('todo_mutated'));

      // If we are not on todos or dashboard, navigate to todos
      if (location.pathname !== '/todos' && location.pathname !== '/dashboard') {
        navigate('/todos');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create todo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgMain flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <Navbar
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Add Modal */}
      <TodoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTodo}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
