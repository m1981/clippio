/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import TaskList from './TaskList.svelte';
import type { Task } from '$lib/types';

describe('TaskList Component - Unit Tests', () => {
	const mockTasks: Task[] = [
		{ id: '1', title: 'Test Task 1', completed: false, priority: 'high' },
		{ id: '2', title: 'Test Task 2', completed: true, priority: 'medium' },
		{ id: '3', title: 'Test Task 3', completed: false, priority: 'low' }
	];

	const defaultProps = {
		tasks: mockTasks,
		projectId: 'project-1',
		onTaskToggle: vi.fn(),
		onTaskDelete: vi.fn(),
		onTaskEdit: vi.fn(),
		onTaskSetPriority: vi.fn()
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Context Menu State Management', () => {
		it('should manage dropdown state correctly for multiple tasks', async () => {
			render(TaskList, { props: defaultProps });

			// Open dropdown for first task
			const firstButton = screen.getByLabelText('Open task menu for Test Task 1');
			await fireEvent.click(firstButton);

			// Verify only first dropdown is open
			expect(
				screen.getByRole('menu', { name: /Task actions for Test Task 1/ })
			).toBeInTheDocument();
			expect(
				screen.queryByRole('menu', { name: /Task actions for Test Task 2/ })
			).not.toBeInTheDocument();

			// Open dropdown for second task
			const secondButton = screen.getByLabelText('Open task menu for Test Task 2');
			await fireEvent.click(secondButton);

			// Verify first closes, second opens
			expect(
				screen.queryByRole('menu', { name: /Task actions for Test Task 1/ })
			).not.toBeInTheDocument();
			expect(
				screen.getByRole('menu', { name: /Task actions for Test Task 2/ })
			).toBeInTheDocument();
		});

		it('should handle missing optional callbacks gracefully', async () => {
			const {
				onTaskEdit: _onTaskEdit,
				onTaskSetPriority: _onTaskSetPriority,
				...requiredProps
			} = defaultProps;

			expect(() => {
				render(TaskList, { props: requiredProps });
			}).not.toThrow();
		});
	});

	describe('Mouse Position Tracking', () => {
		it('should track mouse position for context menu positioning', async () => {
			render(TaskList, { props: defaultProps });

			const button = screen.getByLabelText('Open task menu for Test Task 1');

			// Mock getBoundingClientRect for consistent positioning
			const mockRect = { clientX: 100, clientY: 200 };
			await fireEvent.click(button, mockRect);

			const menu = screen.getByRole('menu');
			const style = menu.getAttribute('style');

			// Verify positioning logic (accounting for window bounds)
			expect(style).toContain('top:');
			expect(style).toContain('left:');
		});

		it('should handle right-click context menu positioning', async () => {
			render(TaskList, { props: defaultProps });

			const taskDiv = screen.getByLabelText('Task: Test Task 1');

			await fireEvent.contextMenu(taskDiv, { clientX: 150, clientY: 250 });

			const menu = screen.getByRole('menu');
			expect(menu).toBeInTheDocument();
		});
	});

	describe('Keyboard Navigation', () => {
		it('should open context menu with Enter key', async () => {
			render(TaskList, { props: defaultProps });

			const taskDiv = screen.getByLabelText('Task: Test Task 1');
			taskDiv.focus();

			await fireEvent.keyDown(taskDiv, { key: 'Enter' });

			expect(screen.getByRole('menu')).toBeInTheDocument();
		});

		it('should open context menu with Space key', async () => {
			render(TaskList, { props: defaultProps });

			const taskDiv = screen.getByLabelText('Task: Test Task 1');
			taskDiv.focus();

			await fireEvent.keyDown(taskDiv, { key: ' ' });

			expect(screen.getByRole('menu')).toBeInTheDocument();
		});

		it('should close context menu with Escape key', async () => {
			render(TaskList, { props: defaultProps });

			// Open menu first
			const button = screen.getByLabelText('Open task menu for Test Task 1');
			await fireEvent.click(button);

			// Close with Escape
			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});
	});

	describe('Priority Badge Rendering', () => {
		it('should render correct priority badge classes', () => {
			render(TaskList, { props: defaultProps });

			// High priority - red
			const highPriorityBadge = screen.getByLabelText('Priority: high');
			expect(highPriorityBadge).toHaveClass('bg-red-100', 'text-red-800');

			// Medium priority - yellow
			const mediumPriorityBadge = screen.getByLabelText('Priority: medium');
			expect(mediumPriorityBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');

			// Low priority - gray
			const lowPriorityBadge = screen.getByLabelText('Priority: low');
			expect(lowPriorityBadge).toHaveClass('bg-gray-100', 'text-gray-800');
		});
	});

	describe('Callback Invocations', () => {
		it('should call onTaskSetPriority with correct parameters', async () => {
			const onTaskSetPriority = vi.fn();
			render(TaskList, {
				props: { ...defaultProps, onTaskSetPriority }
			});

			// Open context menu
			const button = screen.getByLabelText('Open task menu for Test Task 1');
			await fireEvent.click(button);

			// Click high priority option
			const highPriorityButton = screen.getByLabelText('Set priority to high');
			await fireEvent.click(highPriorityButton);

			expect(onTaskSetPriority).toHaveBeenCalledWith('project-1', '1', 'high');
			expect(onTaskSetPriority).toHaveBeenCalledTimes(1);
		});

		it('should call onTaskEdit and close dropdown', async () => {
			const onTaskEdit = vi.fn();
			render(TaskList, {
				props: { ...defaultProps, onTaskEdit }
			});

			// Open context menu
			const button = screen.getByLabelText('Open task menu for Test Task 1');
			await fireEvent.click(button);

			// Click edit option
			const editButton = screen.getByLabelText('Edit task');
			await fireEvent.click(editButton);

			expect(onTaskEdit).toHaveBeenCalledWith('project-1', '1');
			expect(screen.queryByRole('menu')).not.toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty tasks array', () => {
			render(TaskList, {
				props: { ...defaultProps, tasks: [] }
			});

			expect(screen.getByText('No tasks yet. Add one above!')).toBeInTheDocument();
		});

		it('should handle missing optional callbacks gracefully', async () => {
			const { onTaskEdit, onTaskSetPriority, ...requiredProps } = defaultProps;

			expect(() => {
				render(TaskList, { props: requiredProps });
			}).not.toThrow();
		});

		it('should prevent event propagation on context menu clicks', async () => {
			const onTaskToggle = vi.fn();
			render(TaskList, {
				props: { ...defaultProps, onTaskToggle }
			});

			const button = screen.getByLabelText('Open task menu for Test Task 1');
			await fireEvent.click(button);

			// Clicking menu button should not trigger task toggle
			expect(onTaskToggle).not.toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('should have proper ARIA attributes', () => {
			render(TaskList, { props: defaultProps });

			// List has proper role
			expect(screen.getByRole('list')).toBeInTheDocument();

			// Tasks have proper labels
			expect(screen.getByLabelText('Task: Test Task 1')).toBeInTheDocument();

			// Context menu has proper attributes
			const button = screen.getByLabelText('Open task menu for Test Task 1');
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});

		it('should update aria-expanded when menu opens', async () => {
			render(TaskList, { props: defaultProps });

			const button = screen.getByLabelText('Open task menu for Test Task 1');

			// Initially collapsed
			expect(button).toHaveAttribute('aria-expanded', 'false');

			// Open menu
			await fireEvent.click(button);
			expect(button).toHaveAttribute('aria-expanded', 'true');
		});
	});
});
