// --- Feature 1: Workout Timer ---
class WorkoutTimer {
    constructor() {
        this.timeLeft = 0;
        this.timerId = null;
        this.isRunning = false;
        this.presets = {
            tabata: { work: 20, rest: 10, rounds: 8 },
            hiit: { work: 45, rest: 15, rounds: 10 },
            custom: { work: 30, rest: 30, rounds: 5 }
        };
    }

    start(callback) {
        if (!this.isRunning && this.timeLeft > 0) {
            this.isRunning = true;
            this.timerId = setInterval(() => {
                this.timeLeft--;
                callback(this.timeLeft);
                if (this.timeLeft === 0) {
                    this.stop();
                    new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1HOTgzP0RGTlFdZmNcWFNTVFZZXGBiZGVnammxt8G2pvHs5evs6u7v8vT3+Pn6+vv7+/v7+vr6+vr5+fn5+fn4+Pj4+Pj39/f39/f39/f29vb29vb19fX19fX09PTz8/Pz8/Py8vLx8fHx8fHw8PDv7+/v7+/u7u7t7e3t7e3s7Ozr6+vr6+vq6urp6eno6Ojn5+fm5ubm5ubk5OTj4+Pj4+Pi4uLh4eHh4eHg4ODf39/e3t7d3d3c3Nzc3NzY2NjX19fX19fW1tbV1dXV1dXT09PS0tLS0tLR0dHQ0NDQ0NDPz8/Ozs7Ozs7Nzc3MzMzMzMzLy8vKysrKysrJycnIyMjIyMjHx8fGxsbGxsbFxcXExMTExMTDw8PCwsLCwsLBwcHAwMDAwMC/v7++vr6+vr69vb28vLy8vLy7u7u6urq6urq5ubm4uLi4uLi3t7e2tra2trW1tbS0tLS0tLOzs7KysrKysrGxsbCwsLCwsK+vr66urq6urq2traysrKysrKurq6qqqqqqqampqaioqKioqKenp6ampqampqWlpaSkpKSkpKOjo6Ki').play();
                }
            }, 1000);
        }
    }

    stop() {
        if (this.isRunning) {
            clearInterval(this.timerId);
            this.isRunning = false;
        }
    }

    reset(duration) {
        this.stop();
        this.timeLeft = duration;
    }

    setPreset(presetName) {
        const preset = this.presets[presetName];
        if (preset) {
            return preset.work * preset.rounds + preset.rest * (preset.rounds - 1);
        }
        return 0;
    }
}

// --- Feature 2: Goal Tracking System ---
class GoalTracker {
    constructor() {
        this.goals = JSON.parse(localStorage.getItem('fitness_goals') || '[]');
    }

    addGoal(title, target, deadline, type = 'count') {
        const goal = {
            id: Date.now(),
            title,
            target,
            current: 0,
            deadline: new Date(deadline).getTime(),
            type,
            completed: false,
            createdAt: Date.now()
        };
        this.goals.push(goal);
        this.saveGoals();
        return goal;
    }

    updateProgress(goalId, progress) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.current = progress;
            goal.completed = progress >= goal.target;
            this.saveGoals();
        }
    }

    deleteGoal(goalId) {
        this.goals = this.goals.filter(g => g.id !== goalId);
        this.saveGoals();
    }

    getActiveGoals() {
        return this.goals.filter(g => !g.completed);
    }

    saveGoals() {
        localStorage.setItem('fitness_goals', JSON.stringify(this.goals));
    }
}

// --- Feature 3: Statistics Dashboard ---
class WorkoutStats {
    constructor(workouts = []) {
        this.workouts = workouts;
    }

    getStreak() {
        let currentStreak = 0;
        let lastWorkoutDate = null;

        this.workouts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(workout => {
                const workoutDate = new Date(workout.date);
                if (!lastWorkoutDate) {
                    currentStreak = 1;
                } else {
                    const dayDiff = (lastWorkoutDate - workoutDate) / (1000 * 60 * 60 * 24);
                    if (dayDiff === 1) {
                        currentStreak++;
                    } else if (dayDiff > 1) {
                        currentStreak = 0;
                    }
                }
                lastWorkoutDate = workoutDate;
            });

        return currentStreak;
    }

    getWeeklyStats() {
        const stats = {
            totalWorkouts: 0,
            totalCalories: 0,
            avgDuration: 0,
            mostCommonType: ''
        };

        const now = new Date();
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        const weeklyWorkouts = this.workouts.filter(w => new Date(w.date) >= weekAgo);

        if (weeklyWorkouts.length > 0) {
            stats.totalWorkouts = weeklyWorkouts.length;
            stats.totalCalories = weeklyWorkouts.reduce((sum, w) => sum + w.calories, 0);
            stats.avgDuration = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0) / weeklyWorkouts.length;

            const typeCounts = {};
            weeklyWorkouts.forEach(w => {
                typeCounts[w.type] = (typeCounts[w.type] || 0) + 1;
            });
            stats.mostCommonType = Object.entries(typeCounts)
                .sort((a, b) => b[1] - a[1])[0][0];
        }

        return stats;
    }

    getAchievements() {
        const achievements = [];
        const totalWorkouts = this.workouts.length;
        const streak = this.getStreak();
        const totalCalories = this.workouts.reduce((sum, w) => sum + w.calories, 0);

        if (totalWorkouts >= 10) achievements.push({ title: 'Getting Started', description: 'Complete 10 workouts' });
        if (totalWorkouts >= 50) achievements.push({ title: 'Fitness Enthusiast', description: 'Complete 50 workouts' });
        if (streak >= 7) achievements.push({ title: 'Week Warrior', description: '7-day workout streak' });
        if (totalCalories >= 5000) achievements.push({ title: 'Calorie Crusher', description: 'Burn 5000 total calories' });

        return achievements;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const authContainer = document.getElementById('auth-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    
    const loginSection = document.getElementById('login-section');
    const signupSection = document.getElementById('signup-section');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    const workoutForm = document.getElementById('workout-form');
    const workoutList = document.getElementById('workout-list');
    const totalWorkoutsDisplay = document.getElementById('total-workouts');
    const totalCaloriesDisplay = document.getElementById('total-calories');

    // Simple in-memory data store (In a real app, this would be a database)
    let userWorkouts = [];
    let loggedIn = false;

    // --- Helper Functions ---

    /** Toggles between Login and Signup forms */
    const switchAuthView = (showLogin) => {
        if (showLogin) {
            loginSection.classList.remove('hidden');
            signupSection.classList.add('hidden');
        } else {
            loginSection.classList.add('hidden');
            signupSection.classList.remove('hidden');
        }
    };

    /** Updates the dashboard view */
    const renderDashboard = () => {
        // Calculate totals
        const totalWorkouts = userWorkouts.length;
        const totalCalories = userWorkouts.reduce((sum, workout) => sum + workout.calories, 0);

        // Update stats
        totalWorkoutsDisplay.textContent = totalWorkouts;
        totalCaloriesDisplay.textContent = totalCalories;

        // Render workout list
        workoutList.innerHTML = ''; // Clear existing list
        userWorkouts.forEach((workout, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span><strong>${workout.type}</strong> (${workout.duration} mins)</span>
                <span>${workout.calories} Cal</span>
            `;
            workoutList.appendChild(listItem);
        });
    };
    
    /** Handles the main view change (Auth <-> Dashboard) */
    const toggleAppView = (isLoggedIn) => {
        if (isLoggedIn) {
            authContainer.classList.add('hidden');
            dashboardContainer.classList.remove('hidden');
            renderDashboard(); // Initial render when logging in
        } else {
            authContainer.classList.remove('hidden');
            dashboardContainer.classList.add('hidden');
        }
        loggedIn = isLoggedIn;
    };

    // --- Event Listeners ---

    // 1. Auth View Switch
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthView(false);
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthView(true);
    });

    // 2. Login/Signup (Placeholder - In a real app this uses Fetch API to a server)
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Attempting Login... (Success Placeholder)');
        // *** REAL WORLD: Validate credentials against a server/database ***
        toggleAppView(true);
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Attempting Signup... (Success Placeholder)');
        // *** REAL WORLD: Send new user data to a server/database ***
        toggleAppView(true);
    });
    
    // 3. Logout
    logoutBtn.addEventListener('click', () => {
        alert('Logged out.');
        // *** REAL WORLD: Clear session data/tokens ***
        toggleAppView(false);
        // Reset to login view
        switchAuthView(true); 
    });

    // 4. Workout Tracking
    workoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const type = document.getElementById('workout-type').value;
        const duration = parseInt(document.getElementById('duration').value, 10);
        const calories = parseInt(document.getElementById('calories').value, 10);

        if (type && duration > 0 && calories > 0) {
            const newWorkout = {
                type,
                duration,
                calories,
                date: new Date().toISOString() // ISO format for consistency
            };

            userWorkouts.push(newWorkout);

            // Update monthly goals if manager is available
            if (typeof MonthlyGoalManager !== 'undefined') {
                try {
                    // monthlyGoalManager should be instantiated below; guard in case
                    if (window.monthlyGoalManager) {
                        window.monthlyGoalManager.updateGoalProgress('workouts', 1);
                        window.monthlyGoalManager.updateGoalProgress('minutes', duration);
                        window.monthlyGoalManager.updateGoalProgress('calories', calories);
                    }
                } catch (err) {
                    console.warn('MonthlyGoalManager update failed', err);
                }
            }

            renderDashboard(); // Re-render to show new data
            workoutForm.reset(); // Clear the form
        } else {
            alert('Please fill out all workout fields correctly.');
        }
    });
    
    // Initial State Setup
    toggleAppView(false);

    // Initialize new features
    const workoutTimer = new WorkoutTimer();
    const goalTracker = new GoalTracker();
    // Initialize monthly goals manager (exposed on window for global access)
    window.monthlyGoalManager = (typeof MonthlyGoalManager !== 'undefined') ? new MonthlyGoalManager() : null;
    const workoutStats = new WorkoutStats(userWorkouts);

    // Timer Controls
    const timerDisplay = document.getElementById('timer-display');
    const startTimerBtn = document.getElementById('start-timer');
    const stopTimerBtn = document.getElementById('stop-timer');
    const resetTimerBtn = document.getElementById('reset-timer');
    const timerPresets = document.getElementById('timer-presets');

    if (startTimerBtn && stopTimerBtn && resetTimerBtn && timerPresets) {
        startTimerBtn.addEventListener('click', () => {
            workoutTimer.start(timeLeft => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            });
        });

        stopTimerBtn.addEventListener('click', () => workoutTimer.stop());

        resetTimerBtn.addEventListener('click', () => {
            const preset = timerPresets.value;
            const duration = workoutTimer.setPreset(preset);
            workoutTimer.reset(duration);
            const minutes = Math.floor(duration / 60);
            const seconds = duration % 60;
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        });
    }

    // Goal Tracking
    const goalForm = document.getElementById('goal-form');
    const goalsList = document.getElementById('goals-list');

    if (goalForm) {
        goalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('goal-title').value;
            const target = parseInt(document.getElementById('goal-target').value);
            const deadline = document.getElementById('goal-deadline').value;
            
            if (title && target && deadline) {
                const goal = goalTracker.addGoal(title, target, deadline);
                renderGoals();
                goalForm.reset();
            }
        });
    }

    function renderGoals() {
        if (goalsList) {
            goalsList.innerHTML = '';
            goalTracker.getActiveGoals().forEach(goal => {
                const progress = (goal.current / goal.target) * 100;
                const daysLeft = Math.ceil((goal.deadline - Date.now()) / (1000 * 60 * 60 * 24));
                
                const goalElement = document.createElement('div');
                goalElement.className = 'goal-item';
                goalElement.innerHTML = `
                    <h3>${goal.title}</h3>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                    <p>${goal.current} / ${goal.target} (${daysLeft} days left)</p>
                    <button class="update-progress" data-goal-id="${goal.id}">Update Progress</button>
                    <button class="delete-goal" data-goal-id="${goal.id}">Delete</button>
                `;
                goalsList.appendChild(goalElement);
            });
        }
    }

    // Statistics Dashboard
    function updateStats() {
        const stats = workoutStats.getWeeklyStats();
        const achievements = workoutStats.getAchievements();
        const streak = workoutStats.getStreak();

        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Current Streak</h3>
                        <p>${streak} days</p>
                    </div>
                    <div class="stat-card">
                        <h3>Weekly Workouts</h3>
                        <p>${stats.totalWorkouts}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Calories Burned (Week)</h3>
                        <p>${stats.totalCalories}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Avg. Duration</h3>
                        <p>${Math.round(stats.avgDuration)} mins</p>
                    </div>
                </div>
                <div class="achievements-section">
                    <h3>Achievements</h3>
                    <div class="achievements-grid">
                        ${achievements.map(a => `
                            <div class="achievement-card">
                                <h4>${a.title}</h4>
                                <p>${a.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    // Update statistics when workouts change
    const originalRenderDashboard = renderDashboard;
    renderDashboard = () => {
        originalRenderDashboard();
        updateStats();
        renderGoals();
    };
});