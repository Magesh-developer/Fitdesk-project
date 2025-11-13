// Dashboard Analytics and Features

class DashboardManager {
    constructor() {
        this.charts = {};
        this.personalRecords = {};
        this.monthlyChallenge = null;
        this.initializeCharts();
        this.loadPersonalRecords();
        this.setupMonthlyChallenge();
    }

    // Initialize Charts
    initializeCharts() {
        // Workout Progress Chart
        const workoutCtx = document.getElementById('workoutChart').getContext('2d');
        this.charts.workout = new Chart(workoutCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Workout Duration',
                    data: [],
                    borderColor: '#10b981',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Workout Progress Over Time'
                    }
                }
            }
        });

        // Activity Distribution Chart
        const activityCtx = document.getElementById('activityPieChart').getContext('2d');
        this.charts.activity = new Chart(activityCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#f59e0b',
                        '#ef4444'
                    ]
                }]
            }
        });

        // Weekly Progress Chart
        const weeklyCtx = document.getElementById('weeklyProgressChart').getContext('2d');
        this.charts.weekly = new Chart(weeklyCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Workouts',
                    data: Array(7).fill(0),
                    backgroundColor: '#10b981'
                }]
            }
        });
    }

    // Update Charts with New Data
    updateCharts(workouts) {
        // Update main workout chart
        const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.date) - new Date(b.date));
        this.charts.workout.data.labels = sortedWorkouts.map(w => new Date(w.date).toLocaleDateString());
        this.charts.workout.data.datasets[0].data = sortedWorkouts.map(w => w.duration);
        this.charts.workout.update();

        // Update activity distribution
        const activityCounts = {};
        workouts.forEach(w => {
            activityCounts[w.type] = (activityCounts[w.type] || 0) + 1;
        });
        this.charts.activity.data.labels = Object.keys(activityCounts);
        this.charts.activity.data.datasets[0].data = Object.values(activityCounts);
        this.charts.activity.update();

        // Update weekly progress
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weeklyData = Array(7).fill(0);
        
        workouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            if (workoutDate >= weekStart) {
                const dayIndex = workoutDate.getDay();
                weeklyData[dayIndex]++;
            }
        });
        
        this.charts.weekly.data.datasets[0].data = weeklyData;
        this.charts.weekly.update();
    }

    // Personal Records Management
    loadPersonalRecords() {
        this.personalRecords = JSON.parse(localStorage.getItem('personal_records') || '{}');
        this.renderPersonalRecords();
    }

    updatePersonalRecord(workoutData) {
        const { type, duration, calories } = workoutData;
        
        if (!this.personalRecords[type]) {
            this.personalRecords[type] = {
                longestDuration: duration,
                maxCalories: calories,
                totalWorkouts: 1
            };
        } else {
            const record = this.personalRecords[type];
            record.longestDuration = Math.max(record.longestDuration, duration);
            record.maxCalories = Math.max(record.maxCalories, calories);
            record.totalWorkouts++;
        }

        localStorage.setItem('personal_records', JSON.stringify(this.personalRecords));
        this.renderPersonalRecords();
        this.checkAndCelebrateRecords(workoutData, type);
    }

    renderPersonalRecords() {
        const recordsContainer = document.getElementById('personal-records');
        if (!recordsContainer) return;

        recordsContainer.innerHTML = Object.entries(this.personalRecords)
            .map(([type, records]) => `
                <div class="record-card">
                    <h4>${type}</h4>
                    <ul>
                        <li>Longest: ${records.longestDuration} mins</li>
                        <li>Max Calories: ${records.maxCalories}</li>
                        <li>Total: ${records.totalWorkouts} workouts</li>
                    </ul>
                </div>
            `).join('');
    }

    checkAndCelebrateRecords(workout, type) {
        const records = this.personalRecords[type];
        if (workout.duration === records.longestDuration || 
            workout.calories === records.maxCalories) {
            this.showCelebration('🎉 New Personal Record!');
        }
    }

    // Monthly Challenge System
    setupMonthlyChallenge() {
        const currentChallenge = JSON.parse(localStorage.getItem('current_challenge'));
        
        if (!currentChallenge || this.isNewMonth(currentChallenge.startDate)) {
            this.createNewMonthlyChallenge();
        } else {
            this.monthlyChallenge = currentChallenge;
        }
        
        this.updateChallengeUI();
    }

    createNewMonthlyChallenge() {
        const challenges = [
            { title: '20 Workouts Challenge', target: 20, type: 'count' },
            { title: '1000 Minute Challenge', target: 1000, type: 'duration' },
            { title: '5000 Calorie Challenge', target: 5000, type: 'calories' }
        ];

        this.monthlyChallenge = {
            ...challenges[Math.floor(Math.random() * challenges.length)],
            progress: 0,
            startDate: new Date().toISOString(),
            completed: false
        };

        localStorage.setItem('current_challenge', JSON.stringify(this.monthlyChallenge));
    }

    updateChallengeProgress(workout) {
        if (!this.monthlyChallenge || this.monthlyChallenge.completed) return;

        switch (this.monthlyChallenge.type) {
            case 'count':
                this.monthlyChallenge.progress++;
                break;
            case 'duration':
                this.monthlyChallenge.progress += workout.duration;
                break;
            case 'calories':
                this.monthlyChallenge.progress += workout.calories;
                break;
        }

        if (this.monthlyChallenge.progress >= this.monthlyChallenge.target) {
            this.monthlyChallenge.completed = true;
            this.showCelebration('🏆 Monthly Challenge Completed!');
        }

        localStorage.setItem('current_challenge', JSON.stringify(this.monthlyChallenge));
        this.updateChallengeUI();
    }

    updateChallengeUI() {
        const titleEl = document.getElementById('challenge-title');
        const statusEl = document.getElementById('challenge-status');
        const progressBar = document.getElementById('challenge-progress-bar');

        if (titleEl && statusEl && progressBar && this.monthlyChallenge) {
            titleEl.textContent = this.monthlyChallenge.title;
            const progress = (this.monthlyChallenge.progress / this.monthlyChallenge.target) * 100;
            statusEl.textContent = `${this.monthlyChallenge.progress} / ${this.monthlyChallenge.target}`;
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
    }

    // Workout Recommendations
    generateRecommendations(workouts) {
        const recommendations = [];
        const recentWorkouts = workouts.slice(-5);
        
        // Check workout frequency
        const workoutsThisWeek = workouts.filter(w => {
            const workoutDate = new Date(w.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return workoutDate >= weekAgo;
        }).length;

        if (workoutsThisWeek < 3) {
            recommendations.push({
                type: 'frequency',
                message: 'Try to get at least 3 workouts this week for optimal results!',
                icon: '🎯'
            });
        }

        // Check workout variety
        const uniqueTypes = new Set(recentWorkouts.map(w => w.type)).size;
        if (uniqueTypes < 2) {
            recommendations.push({
                type: 'variety',
                message: 'Mix up your routine! Try a different type of workout next time.',
                icon: '🔄'
            });
        }

        // Duration progression
        const averageDuration = recentWorkouts.reduce((sum, w) => sum + w.duration, 0) / recentWorkouts.length;
        if (averageDuration < 30) {
            recommendations.push({
                type: 'duration',
                message: 'Consider gradually increasing your workout duration to 30+ minutes.',
                icon: '⏱️'
            });
        }

        this.updateRecommendationsUI(recommendations);
    }

    updateRecommendationsUI(recommendations) {
        const container = document.getElementById('workout-recommendations');
        if (!container) return;

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <span class="rec-icon">${rec.icon}</span>
                <p>${rec.message}</p>
            </div>
        `).join('');
    }

    // Utility Functions
    isNewMonth(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        return date.getMonth() !== today.getMonth() || date.getFullYear() !== today.getFullYear();
    }

    showCelebration(message) {
        const celebration = document.createElement('div');
        celebration.className = 'celebration-popup';
        celebration.textContent = message;
        document.body.appendChild(celebration);

        setTimeout(() => {
            celebration.classList.add('fade-out');
            setTimeout(() => celebration.remove(), 500);
        }, 3000);
    }

    // Main update method to be called after each workout
    updateDashboard(workouts) {
        this.updateCharts(workouts);
        this.generateRecommendations(workouts);
        if (workouts.length > 0) {
            this.updatePersonalRecord(workouts[workouts.length - 1]);
            this.updateChallengeProgress(workouts[workouts.length - 1]);
        }
    }
}

// Export the DashboardManager
window.DashboardManager = DashboardManager;