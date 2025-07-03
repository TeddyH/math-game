// 비행기 수학 게임 JavaScript

class RacingMathGame {
    constructor() {
        this.currentLevel = null;
        this.currentOperation = null;
        this.currentProblem = null;
        this.totalScore = 0;
        this.currentDistance = 0;
        this.problemCount = 0;
        this.correctAnswers = 0; this.maxProblems = 10;
        this.isGameActive = false;
        this.gameSpeed = 1000; // 문제 간격 (ms)        this.planePosition = 1; // 0: 왼쪽, 1: 중앙, 2: 오른쪽
        this.cloudsFalling = false;
        this.planeX = 50; // 퍼센트 단위로 비행기 위치 (0-100)
        this.keysPressed = {}; // 눌린 키 상태 추적
        this.isDragging = false;

        this.initializeGame();
    }

    initializeGame() {
        this.bindEvents();
        this.showStartScreen();
    }

    bindEvents() {
        // 난이도 선택 (클릭과 터치 모두 지원)
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            const selectDifficulty = (e) => {
                e.preventDefault();
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.currentLevel = parseInt(btn.dataset.level);
                this.checkStartButtonState();
            };

            btn.addEventListener('click', selectDifficulty);
            btn.addEventListener('touchend', selectDifficulty);
        });

        // 연산 선택 (클릭과 터치 모두 지원)
        document.querySelectorAll('.operation-btn').forEach(btn => {
            const selectOperation = (e) => {
                e.preventDefault();
                document.querySelectorAll('.operation-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.currentOperation = btn.dataset.operation;
                this.checkStartButtonState();
            };

            btn.addEventListener('click', selectOperation);
            btn.addEventListener('touchend', selectOperation);
        });

        // 게임 시작 (클릭과 터치 모두 지원)
        const startBtn = document.getElementById('startGameBtn');
        const startGame = (e) => {
            e.preventDefault();
            this.startGame();
        };

        startBtn.addEventListener('click', startGame);
        startBtn.addEventListener('touchend', startGame);

        // 키보드 조작 (부드러운 이동)
        document.addEventListener('keydown', (e) => {
            if (this.isGameActive && this.cloudsFalling) {
                if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                    this.keysPressed.left = true;
                    e.preventDefault();
                } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                    this.keysPressed.right = true;
                    e.preventDefault();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keysPressed.left = false;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keysPressed.right = false;
            }
        });

        // 드래그 조작 (모바일)
        let startX = 0;
        let lastX = 0;

        document.addEventListener('touchstart', (e) => {
            if (this.isGameActive && this.cloudsFalling) {
                this.isDragging = true;
                startX = e.touches[0].clientX;
                lastX = startX;
                e.preventDefault();
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isGameActive && this.cloudsFalling && this.isDragging) {
                const currentX = e.touches[0].clientX;
                const deltaX = currentX - lastX;

                // 화면 너비 대비 이동량 계산 (더 민감하게)
                const screenWidth = window.innerWidth;
                const movePercent = (deltaX / screenWidth) * 150; // 150%로 민감도 증가

                this.movePlaneToPosition(this.planeX + movePercent);
                lastX = currentX;
                e.preventDefault();
            }
        });

        document.addEventListener('touchend', (e) => {
            this.isDragging = false;
            e.preventDefault();
        });

        // 구름 클릭은 제거 (이제 비행기를 이동시켜야 함)

        // 게임 종료 후 버튼들 (클릭과 터치 모두 지원)
        const playAgainBtn = document.getElementById('playAgainBtn');
        const resetGame = (e) => {
            e.preventDefault();
            this.resetGame();
        };
        playAgainBtn.addEventListener('click', resetGame);
        playAgainBtn.addEventListener('touchend', resetGame);

        const saveScoreBtn = document.getElementById('saveScoreBtn');
        const saveScore = (e) => {
            e.preventDefault();
            this.saveScore();
        };
        saveScoreBtn.addEventListener('click', saveScore);
        saveScoreBtn.addEventListener('touchend', saveScore);

        const viewRankingsBtn = document.getElementById('viewRankingsBtn');
        const viewRankings = (e) => {
            e.preventDefault();
            window.location.href = '/rankings';
        };
        viewRankingsBtn.addEventListener('click', viewRankings);
        viewRankingsBtn.addEventListener('touchend', viewRankings);

        // 화면 크기 변경 시 블록 크기 재조정
        window.addEventListener('resize', () => {
            if (this.isGameActive && document.getElementById('clouds').style.display === 'flex') {
                this.adjustBlockSizes();
            }
        });
    }

    checkStartButtonState() {
        const startBtn = document.getElementById('startGameBtn');
        if (this.currentLevel && this.currentOperation) {
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
        } else {
            startBtn.disabled = true;
            startBtn.style.opacity = '0.5';
        }
    }

    showStartScreen() {
        document.getElementById('startScreen').style.display = 'flex';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
    }

    startGame() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';

        this.resetGameStats();
        this.isGameActive = true;
        this.startKeyboardLoop(); // 키보드 연속 입력 처리 시작
        this.showNextProblem();
    }

    startKeyboardLoop() {
        // 키보드 연속 입력을 위한 루프
        if (this.keyboardInterval) {
            clearInterval(this.keyboardInterval);
        }

        this.keyboardInterval = setInterval(() => {
            if (this.isGameActive && this.cloudsFalling) {
                if (this.keysPressed.left) {
                    this.movePlaneSmooth(-2); // 2% 왼쪽으로
                }
                if (this.keysPressed.right) {
                    this.movePlaneSmooth(2); // 2% 오른쪽으로
                }
            }
        }, 50); // 50ms마다 체크 (부드러운 움직임)
    }

    movePlaneSmooth(deltaPercent) {
        this.planeX += deltaPercent;

        // 경계 처리 (10% ~ 90% 범위 내)
        if (this.planeX < 10) this.planeX = 10;
        if (this.planeX > 90) this.planeX = 90;

        this.updatePlanePosition();
    }

    movePlaneToPosition(newX) {
        // 경계 처리 (10% ~ 90% 범위 내)
        if (newX < 10) newX = 10;
        if (newX > 90) newX = 90;

        this.planeX = newX;
        this.updatePlanePosition();
    }

    updatePlanePosition() {
        const plane = document.getElementById('playerPlane');
        plane.style.left = this.planeX + '%';

        // 기울기 효과 (이동 방향에 따라)
        const tilt = Math.sin(Date.now() / 200) * 5; // 자연스러운 흔들림
        plane.style.transform = `translateX(-50%) rotate(${tilt}deg)`;

        // 구름 하이라이트 효과 (어떤 구름과 충돌할지 시각적으로 표시)
        this.highlightTargetCloud();
    }

    highlightTargetCloud() {
        if (!this.cloudsFalling) return;

        const targetIndex = this.getHitCloudIndex();
        const clouds = document.querySelectorAll('.cloud-choice');

        // 모든 구름의 하이라이트 제거
        clouds.forEach(cloud => cloud.classList.remove('target-highlight'));

        // 타겟 구름 하이라이트
        if (clouds[targetIndex]) {
            clouds[targetIndex].classList.add('target-highlight');
        }
    }

    resetGameStats() {
        this.totalScore = 0;
        this.currentDistance = 0;
        this.problemCount = 0;
        this.correctAnswers = 0;
        this.planeX = 50; // 비행기를 중앙으로 리셋
        this.updateUI();
    }

    async showNextProblem() {
        if (this.problemCount >= this.maxProblems) {
            this.endGame(true); // 성공적으로 완료
            return;
        }

        this.problemCount++;

        // 문제 생성 요청
        try {
            const response = await fetch('/api/generate_problem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation: this.currentOperation,
                    level: this.currentLevel
                })
            });

            const data = await response.json();
            this.currentProblem = data;

            this.displayProblem();

        } catch (error) {
            console.error('문제 생성 오류:', error);
            this.endGame(false);
        }
    }

    displayProblem() {
        // 문제 표시
        document.getElementById('mathQuestion').textContent = this.currentProblem.question + ' = ?';

        // 선택지 표시
        const choices = this.currentProblem.choices;
        for (let i = 0; i < 3; i++) {
            document.getElementById(`choice${i}`).textContent = choices[i];
        }

        // 구름을 상단에 위치시키고 떨어뜨리기 시작
        this.showClouds();
        this.updateUI();

        setTimeout(() => {
            this.startCloudFall();
        }, 1000); // 1초 후 구름이 떨어지기 시작
    }

    showClouds() {
        const clouds = document.getElementById('clouds');
        clouds.style.display = 'flex';

        // 블록 크기를 화면 너비의 1/3로 동적 설정
        this.adjustBlockSizes();

        // 구름 선택지 초기화
        document.querySelectorAll('.cloud-choice').forEach(cloud => {
            cloud.classList.remove('correct', 'wrong');
        });
    }

    adjustBlockSizes() {
        const screenWidth = window.innerWidth;
        const blockWidth = Math.floor(screenWidth / 3);

        // 각 블록의 너비를 화면의 1/3로 설정
        document.querySelectorAll('.cloud-choice').forEach(choice => {
            choice.style.width = blockWidth + 'px';
        });

        // 숫자 블록(.cloud-sign)의 크기도 조정
        const signWidth = Math.min(blockWidth * 0.8, 150); // 블록 너비의 80% 또는 최대 150px
        const fontSize = Math.min(signWidth / 4, 32); // 너비에 비례하되 최대 32px

        document.querySelectorAll('.cloud-sign').forEach(sign => {
            sign.style.width = signWidth + 'px';
            sign.style.fontSize = fontSize + 'px';
            sign.style.padding = Math.floor(fontSize * 0.6) + 'px ' + Math.floor(fontSize * 0.8) + 'px';
        });
    }

    animatePlane() {
        const plane = document.getElementById('playerPlane');
        plane.style.animation = 'none';
        setTimeout(() => {
            plane.style.animation = 'planeFly 1s ease-in-out infinite alternate';
        }, 100);
    }

    startCloudFall() {
        this.cloudsFalling = true;
        const clouds = document.getElementById('clouds');
        clouds.style.animation = 'cloudsFall 3s linear forwards';

        // 3초 후 충돌 체크
        setTimeout(() => {
            this.checkCollision();
        }, 2900); // 충돌 판정 약간 빠르게
    }

    checkCollision() {
        this.cloudsFalling = false;
        const correctIndex = this.currentProblem.choices.indexOf(this.currentProblem.answer);
        const hitCloudIndex = this.getHitCloudIndex();

        const isCorrect = hitCloudIndex === correctIndex;
        this.showCollisionEffect(isCorrect, hitCloudIndex, correctIndex);

        if (isCorrect) {
            // 정답!
            this.correctAnswers++;
            this.totalScore += this.currentProblem.points;
            this.currentDistance += 100; // 100m 상승
            this.showSuccessEffect();

            setTimeout(() => {
                this.hideClouds();
                this.showNextProblem();
            }, 1500);
        } else {
            // 오답 - 게임 종료
            this.showFailureEffect();
            setTimeout(() => {
                this.endGame(false);
            }, 1500);
        }

        this.updateUI();
    }

    hideClouds() {
        const cloudsContainer = document.getElementById('clouds');
        cloudsContainer.style.animation = 'none';
        cloudsContainer.style.display = 'none';
        document.querySelectorAll('.cloud-choice').forEach(cloud => {
            cloud.style.opacity = '1';
            cloud.style.transform = 'scale(1)';
        });
    }

    showCollisionEffect(isCorrect, hitCloudIndex, correctIndex) {
        const clouds = document.querySelectorAll('.cloud-choice');
        const hitCloud = clouds[hitCloudIndex];

        if (isCorrect) {
            // 점수 팝업 생성
            const scorePopup = document.createElement('div');
            scorePopup.textContent = `+${this.currentProblem.points}`
            scorePopup.className = 'score-popup';
            hitCloud.appendChild(scorePopup);

            // 팝업 애니메이션 후 제거
            setTimeout(() => {
                scorePopup.remove();
            }, 1000);

            // 맞춘 구름 사라지는 효과
            hitCloud.style.transition = 'opacity 0.5s, transform 0.5s';
            hitCloud.style.opacity = '0';
            hitCloud.style.transform = 'scale(0.5)';

        } else {
            // 틀린 구름 흔들리는 효과
            const correctCloud = clouds[correctIndex];
            if (correctCloud) {
                correctCloud.classList.add('correct-indicator');
            }
            if (hitCloud) {
                hitCloud.classList.add('wrong-shake');
            }
        }
    }

    getHitCloudIndex() {
        // 구름 영역: 왼쪽(10-40%), 중앙(40-60%), 오른쪽(60-90%)
        if (this.planeX >= 10 && this.planeX < 40) {
            return 0; // 왼쪽 구름
        } else if (this.planeX >= 40 && this.planeX < 60) {
            return 1; // 중앙 구름
        } else if (this.planeX >= 60 && this.planeX <= 90) {
            return 2; // 오른쪽 구름
        }

        // 경계 밖에 있을 경우 가장 가까운 구름 선택
        if (this.planeX < 40) return 0;
        if (this.planeX > 60) return 2;
        return 1;
    }

    showSuccessEffect() {
        // 비행기 상승 효과 (부드럽게)
        const plane = document.getElementById('playerPlane');
        plane.style.animation = 'planeClimb 0.8s ease-out';

        setTimeout(() => {
            // 기본 비행 애니메이션으로 돌아갈 때 transform 속성 초기화
            plane.style.animation = '';
            plane.style.transform = 'translateX(-50%)';
            // 약간의 딜레이 후 다시 애니메이션 시작하여 깜빡임 방지
            setTimeout(() => {
                plane.style.animation = 'planeFly 1s ease-in-out infinite alternate';
            }, 50);
        }, 800);
    }

    showFailureEffect() {
        // 비행기 추락 효과
        const plane = document.getElementById('playerPlane');
        plane.style.animation = 'planeFall 1s ease-out';
        plane.style.filter = 'grayscale(1) brightness(0.7)';
    }

    updateUI() {
        document.getElementById('totalScore').textContent = this.totalScore;
        document.getElementById('currentDistance').textContent = this.currentDistance;
        document.getElementById('problemCount').textContent = this.problemCount;

        // 진행률 바 업데이트
        const progress = (this.problemCount / this.maxProblems) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
    }

    endGame(isSuccess) {
        this.isGameActive = false;

        // 키보드 루프 정리
        if (this.keyboardInterval) {
            clearInterval(this.keyboardInterval);
            this.keyboardInterval = null;
        }

        // 최종 통계 계산
        const accuracyRate = this.problemCount > 0 ? Math.round((this.correctAnswers / this.problemCount) * 100) : 0;

        // 게임 종료 화면 데이터 설정
        document.getElementById('gameOverTitle').textContent = isSuccess ?
            '🏁 완주 성공!' : '💥 게임 종료!';
        document.getElementById('finalScore').textContent = this.totalScore;
        document.getElementById('finalDistance').textContent = this.currentDistance;
        document.getElementById('accuracyRate').textContent = accuracyRate;

        // 게임 종료 화면 표시
        document.getElementById('gameOverScreen').style.display = 'flex';
    }

    async saveScore() {
        try {
            const response = await fetch('/api/save_racing_score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    score: this.totalScore,
                    distance: this.currentDistance,
                    accuracy: Math.round((this.correctAnswers / this.problemCount) * 100)
                })
            });

            if (response.ok) {
                alert('점수가 저장되었습니다!');
                window.location.href = '/rankings';
            } else {
                alert('점수 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('점수 저장 오류:', error);
            alert('점수 저장 중 오류가 발생했습니다.');
        }
    } resetGame() {
        // 비행기 스타일 초기화
        const plane = document.getElementById('playerPlane');
        plane.style.animation = 'planeFly 1s ease-in-out infinite alternate';
        plane.style.filter = 'none';

        // 구름 숨기기 및 상태 초기화
        this.hideClouds();

        this.showStartScreen();
    }
}

// 추가 CSS 애니메이션을 동적으로 추가
function addDynamicAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes planeClimb {
            0% { transform: translateX(-50%) translateY(0) rotate(-2deg) scale(1); }
            50% { transform: translateX(-50%) translateY(-25px) rotate(-15deg) scale(1.2); }
            100% { transform: translateX(-50%) translateY(0) rotate(2deg) scale(1); }
        }
        
        @keyframes planeFall {
            0% { transform: translateX(-50%) translateY(0) rotate(-2deg); }
            25% { transform: translateX(-55%) translateY(5px) rotate(-10deg); }
            75% { transform: translateX(-45%) translateY(10px) rotate(10deg); }
            100% { transform: translateX(-50%) translateY(15px) rotate(0deg); }
        }
        
        .road-lines .plane-effect {
            animation-play-state: running;
        }
        
        .game-screen.paused .road-lines .plane-effect {
            animation-play-state: paused;
        }
    `;
    document.head.appendChild(style);
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', function () {
    addDynamicAnimations();
    const game = new RacingMathGame();
});

// 모바일 터치 최적화
document.addEventListener('touchstart', function (e) {
    if (e.target.classList.contains('cloud-choice')) {
        e.target.style.opacity = '0.8';
    }
});

document.addEventListener('touchend', function (e) {
    if (e.target.classList.contains('cloud-choice')) {
        e.target.style.opacity = '1';
    }
});

// 키보드 지원 (화살표 키와 A/D로 비행기 조작)
document.addEventListener('keydown', function (e) {
    if (document.getElementById('gameScreen').style.display === 'block') {
        // 비행기 조작 키들은 게임 인스턴스에서 처리됨
    }
});
