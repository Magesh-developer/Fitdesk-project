// Monthly Goals Management System
class MonthlyGoalManager {
    constructor() {
        this.goals = [];
        this.loadGoals();
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        const goalForm = document.getElementById('monthly-goal-form');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewGoal();
            });
        }

        // Set default deadline to end of current month
        const deadlineInput = document.getElementById('goal-deadline');
        if (deadlineInput) {
            const today = new Date();
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            deadlineInput.value = lastDay.toISOString().split('T')[0];
        }
    }

    // Handle new goal submission
    handleNewGoal() {
        const category = document.getElementById('goal-category').value;
        const target = parseInt(document.getElementById('goal-target').value);
        const deadline = document.getElementById('goal-deadline').value;

        if (category && target && deadline) {
            const newGoal = {
                id: Date.now(),
                category,
                target,
                deadline,
                current: 0,
                milestones: this.generateMilestones(target),
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };

            this.goals.push(newGoal);
            this.saveGoals();
            this.renderGoals();
            this.showNotification('New monthly goal set! 🎯');

            // Reset form
            document.getElementById('monthly-goal-form').reset();
        }
    }

    // Generate milestone checkpoints
    generateMilestones(target) {
        return [
            { percentage: 25, reached: false, reward: '🌱 Getting Started' },
            { percentage: 50, reached: false, reward: '🌿 Halfway There' },
            { percentage: 75, reached: false, reward: '🌳 Almost Done' },
            { percentage: 100, reached: false, reward: '🏆 Goal Achieved' }
        ].map(milestone => ({
            ...milestone,
            value: Math.round(target * (milestone.percentage / 100))
        }));
    }

    // Update goal progress
    updateGoalProgress(category, value) {
        let updated = false;
        this.goals.forEach(goal => {
            if (goal.category === category && !this.isGoalExpired(goal)) {
                goal.current += value;
                goal.lastUpdated = new Date().toISOString();
                
                // Check milestones
                goal.milestones.forEach(milestone => {
                    if (!milestone.reached && goal.current >= milestone.value) {
                        milestone.reached = true;
                        this.celebrateMilestone(milestone);
                    }
                });

                updated = true;
            }
        });

        if (updated) {
            this.saveGoals();
            this.renderGoals();
        }
    }

    // Check if goal is expired
    isGoalExpired(goal) {
        return new Date(goal.deadline) < new Date();
    }

    // Celebrate reaching a milestone
    celebrateMilestone(milestone) {
        this.showNotification(`Milestone Reached: ${milestone.reward} 🎉`);
        
        // Create celebration animation
        const celebration = document.createElement('div');
        celebration.className = 'milestone-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <h3>${milestone.reward}</h3>
                <p>${milestone.percentage}% Complete!</p>
            </div>
        `;
        document.body.appendChild(celebration);

        // Remove celebration after animation
        setTimeout(() => {
            celebration.classList.add('fade-out');
            setTimeout(() => celebration.remove(), 500);
        }, 3000);
    }

    // Render goals in the UI
    renderGoals() {
        const container = document.getElementById('active-goals-container');
        const progressCards = document.getElementById('goal-progress-cards');
        const timelineContainer = document.getElementById('milestone-timeline');

        if (!container || !progressCards || !timelineContainer) return;

        // Clear existing content
        container.innerHTML = '';
        progressCards.innerHTML = '';
        timelineContainer.innerHTML = '';

        // Filter and sort goals
        const activeGoals = this.goals
            .filter(goal => !this.isGoalExpired(goal))
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

        // Render each goal
        activeGoals.forEach(goal => {
            // Calculate progress percentage
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));

            // Add goal card
            container.innerHTML += `
                <div class="goal-card">
                    <div class="goal-header">
                        <h5>${this.formatCategory(goal.category)}</h5>
                        <span class="days-left">${daysLeft} days left</span>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-text">
                            ${goal.current} / ${goal.target} (${Math.round(progress)}%)
                        </div>
                    </div>
                </div>
            `;

            // Add progress card
            progressCards.innerHTML += `
                <div class="progress-card">
                    <div class="card-header">
                        <span class="category-icon">${this.getCategoryIcon(goal.category)}</span>
                        <span class="category-name">${this.formatCategory(goal.category)}</span>
                    </div>
                    <div class="card-body">
                        <div class="current-value">${goal.current}</div>
                        <div class="target-value">/${goal.target}</div>
                    </div>
                </div>
            `;

            // Add milestone timeline
            const milestoneHtml = goal.milestones
                .map(milestone => `
                    <div class="milestone ${milestone.reached ? 'reached' : ''}">
                        <div class="milestone-marker"></div>
                        <div class="milestone-content">
                            <span class="milestone-value">${milestone.value}</span>
                            <span class="milestone-reward">${milestone.reward}</span>
                        </div>
                    </div>
                `).join('');

            timelineContainer.innerHTML += `
                <div class="goal-timeline">
                    <h5>${this.formatCategory(goal.category)}</h5>
                    <div class="timeline-track">
                        ${milestoneHtml}
                    </div>
                </div>
            `;
        });

        // Show empty state if no active goals
        if (activeGoals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No active monthly goals. Set a new goal to get started!</p>
                </div>
            `;
        }
    }

    // Helper method to format category names
    formatCategory(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    // Get icon for category
    getCategoryIcon(category) {
        const icons = {
            workouts: '💪',
            calories: '🔥',
            minutes: '⏱️',
            distance: '🏃'
        };
        return icons[category] || '🎯';
    }

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // Load goals from localStorage
    loadGoals() {
        try {
            this.goals = JSON.parse(localStorage.getItem('monthly_goals')) || [];
            this.renderGoals();
        } catch (error) {
            console.error('Error loading goals:', error);
            this.goals = [];
        }
    }

    // Save goals to localStorage
    saveGoals() {
        localStorage.setItem('monthly_goals', JSON.stringify(this.goals));
    }
}

// Export the MonthlyGoalManager
window.MonthlyGoalManager = MonthlyGoalManager;