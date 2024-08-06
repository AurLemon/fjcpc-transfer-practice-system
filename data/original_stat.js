var statModule = (function() {
    const totalQuestions = 1394;
    const statisticsItems = document.querySelectorAll('.statistics-item');
    statisticsItems.forEach(statisticsItem => {
        const questionDone = parseInt(statisticsItem.getAttribute('question-done'));
        const percentage = (questionDone / totalQuestions) * 100;

        const progressElement = statisticsItem.querySelector('.statistics-item__progress');
        progressElement.style.width = `${percentage}%`;
        
        if (percentage == 100) {
            progressElement.style.background = 'var(--success-color)';
        }
        
        if (statisticsItem.querySelector('.statistics-item__label #done-progress')) {
            const doneProgressElement = statisticsItem.querySelector('.statistics-item__label #done-progress');
            doneProgressElement.textContent = `${percentage.toFixed(1)}%`;
        }
    });
    
    function rank(sortBy = 'question-done') {
        const sortedItems = Array.from(statisticsItems).sort((a, b) => {
            const doneA = parseInt(a.getAttribute('question-done'));
            const doneB = parseInt(b.getAttribute('question-done'));
            const starA = parseInt(a.getAttribute('star-question'));
            const starB = parseInt(b.getAttribute('star-question'));
            const percentageA = (starA / doneA) * 100 || 0;
            const percentageB = (starB / doneB) * 100 || 0;
    
            if (sortBy === 'star-question') {
                if (starA !== starB) {
                    return starB - starA;
                } else if (doneA !== doneB) {
                    return doneB - doneA;
                } else {
                    return percentageB - percentageA;
                }
            } else if (sortBy === 'star-question-per') {
                if (percentageA !== percentageB) {
                    return percentageB - percentageA;
                } else if (doneA !== doneB) {
                    return doneB - doneA;
                } else {
                    return starB - starA;
                }
            } else {
                if (doneA !== doneB) {
                    return doneB - doneA;
                } else if (starA !== starB) {
                    return starB - starA;
                } else {
                    return percentageB - percentageA;
                }
            }
        });
    
        const sortedNames = sortedItems.map(item => {
            return item.querySelector('#name').textContent;
        });
    
        return sortedNames;
    }

    return {
        rank: rank
    };
})();