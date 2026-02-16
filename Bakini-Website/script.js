(function() {
    // ---------- CONFIG ----------
    const IMAGE_FOLDER = 'images/';          // folder with friend pics (1.jpg, 2.jpg, ...)
    const TOTAL_IMAGES = 10;                  // 🔴 CHANGE to match how many photos you have
    const SCARY_LEFT_THRESHOLD = 5;            // left swipes to trigger black slide
    const WARNING_RIGHT_THRESHOLD = 7;          // right swipes to show message
    
    // BACKGROUND MUSIC CONFIG
    const BACKGROUND_MUSIC_VOLUME = 0.05;        // 0.0 to 1.0
    
    // SOUND CONFIGURATION
    const SOUND_FOLDER = 'sfx/';               // folder where your sound files are stored
    
    // List your sound files for each action
    const SOUNDS = {
        left: [                                 // dislike sounds (bad1 - bad6)
            'bad1.mp3',
            'bad2.mp3',
            'bad3.mp3',
            'bad4.mp3',
            'bad5.mp3',
            'bad6.mp3'
        ],
        right: [                                // like sounds (good1 - good5)
            'good1.mp3',
            'good2.mp3',
            'good3.mp3',
            'good4.mp3',
            'good5.mp3'
        ],
        super: ['perfect.mp3']                   // super like sound (just perfect.mp3)
    };

    // ---------- AUDIO ELEMENTS ----------
    const bgMusic = document.getElementById('backgroundMusic');
    const scarySound = document.getElementById('scarySound');
    
    // Set background music volume
    if (bgMusic) {
        bgMusic.volume = BACKGROUND_MUSIC_VOLUME;
        bgMusic.play().catch(e => console.log('Autoplay prevented:', e));
    }
    
    // Preload scary sound
    if (scarySound) {
        scarySound.load();
        scarySound.volume = 0.8;
    }

    // ===== NEW: Track currently playing sound effect =====
    let currentSoundEffect = null;

    // Audio setup for sound effects - NOW WITH SINGLE INSTANCE PER CATEGORY
    let audioElements = {
        left: [],
        right: [],
        super: []
    };
    
    // Preload all sounds
    function preloadSounds() {
        // Preload left sounds (bad1-bad6)
        SOUNDS.left.forEach(soundFile => {
            const audio = new Audio(SOUND_FOLDER + soundFile);
            audio.preload = 'auto';
            audioElements.left.push(audio);
        });
        
        // Preload right sounds (good1-good5)
        SOUNDS.right.forEach(soundFile => {
            const audio = new Audio(SOUND_FOLDER + soundFile);
            audio.preload = 'auto';
            audioElements.right.push(audio);
        });
        
        // Preload super sound (perfect.mp3)
        SOUNDS.super.forEach(soundFile => {
            const audio = new Audio(SOUND_FOLDER + soundFile);
            audio.preload = 'auto';
            audioElements.super.push(audio);
        });
        
        console.log('Sounds preloaded:', audioElements);
    }

    // ===== UPDATED: Play sound and stop previous one =====
    function playRandomSound(category) {
        const sounds = audioElements[category];
        if (!sounds || sounds.length === 0) {
            console.log(`No sounds loaded for category: ${category}`);
            return;
        }
        
        // STOP any currently playing sound effect immediately
        if (currentSoundEffect) {
            currentSoundEffect.pause();
            currentSoundEffect.currentTime = 0;
            console.log('Stopped previous sound effect');
        }
        
        // Pick a random sound from the array
        const randomIndex = Math.floor(Math.random() * sounds.length);
        const sound = sounds[randomIndex];
        
        // Create a new audio instance for this play
        const newSound = new Audio(sound.src);
        newSound.volume = 0.5;
        
        // Store as currently playing
        currentSoundEffect = newSound;
        
        // When this sound ends, clear the currentSoundEffect if it's still this one
        newSound.addEventListener('ended', function() {
            if (currentSoundEffect === newSound) {
                currentSoundEffect = null;
                console.log('Sound effect ended');
            }
        });
        
        // Play the sound
        newSound.play().catch(e => console.log('Sound play failed:', e));
        
        console.log(`Playing ${category} sound: ${SOUNDS[category][randomIndex]}`);
    }

    // Preload sounds when page loads
    preloadSounds();

    // ---------- STATE ----------
    let currentIndex = 1;
    let leftSwipes = 0;
    let rightSwipes = 0;
    let blockSwipe = false;
    let blackSlideActive = false;

    // DOM elements
    const card = document.getElementById('currentCardModern');
    const cardImg = document.getElementById('cardImgModern');
    const nopeBadge = document.getElementById('nopeBadgeModern');
    const likeBadge = document.getElementById('likeBadgeModern');
    const blackSlide = document.getElementById('blackSlideModern');
    const warningMsg = document.getElementById('warningModern');
    const gifOverlay = document.getElementById('gifModern');

    const nopeBtn = document.getElementById('nopeBtnModern');
    const likeBtn = document.getElementById('likeBtnModern');
    const superBtn = document.getElementById('superBtnModern');

    // Load next image with extension fallback
    function loadNextImage() {
        if (blackSlideActive) return;
        
        const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        let triedExtensions = 0;
        
        function tryNextExtension() {
            if (triedExtensions >= extensions.length) {
                cardImg.src = `https://via.placeholder.com/600x800/2a3440/ffffff?text=Image+${currentIndex}`;
                return;
            }
            
            const ext = extensions[triedExtensions];
            const imgPath = IMAGE_FOLDER + currentIndex + ext;
            
            const testImg = new Image();
            testImg.onload = function() {
                cardImg.src = imgPath;
            };
            testImg.onerror = function() {
                triedExtensions++;
                tryNextExtension();
            };
            testImg.src = imgPath;
        }
        
        triedExtensions = 0;
        tryNextExtension();
        currentIndex = (currentIndex % TOTAL_IMAGES) + 1;
    }

    // Initial load
    loadNextImage();

    function checkRightWarning() {
        if (rightSwipes >= WARNING_RIGHT_THRESHOLD && !blackSlideActive) {
            warningMsg.style.display = 'block';
            setTimeout(() => {
                warningMsg.style.display = 'none';
            }, 2200);
        }
    }

    // Scary GIF function
    function triggerBlackSlide() {
        if (blackSlideActive) return;
        blackSlideActive = true;
        blockSwipe = true;
        
        // STOP any button sound effect that might be playing
        if (currentSoundEffect) {
            currentSoundEffect.pause();
            currentSoundEffect.currentTime = 0;
            currentSoundEffect = null;
        }
        
        // Pause background music
        if (bgMusic && !bgMusic.paused) {
            bgMusic.pause();
        }
        
        // Play scary sound
        if (scarySound) {
            scarySound.currentTime = 0;
            scarySound.play().catch(e => console.log('Scary sound play failed:', e));
        }
        
        blackSlide.classList.add('active', 'scary-pop');
        warningMsg.style.display = 'none';
        
        setTimeout(() => {
            blackSlide.classList.remove('active', 'scary-pop');
            blackSlideActive = false;
            blockSwipe = false;
            
            // Resume background music
            if (bgMusic) {
                bgMusic.play().catch(e => console.log('Could not resume music:', e));
            }
            
            card.style.transition = 'none';
            card.style.transform = 'translateX(0) rotate(0)';
            loadNextImage();
            
            setTimeout(() => {
                card.style.transition = 'transform 0.2s ease';
            }, 50);
        }, 5000);
    }

    // Superlike GIF
    function showSuperGif() {
        gifOverlay.classList.add('show', 'super-enhanced');
        
        setTimeout(() => {
            gifOverlay.classList.remove('show', 'super-enhanced');
        }, 2000);
    }

    function handleSwipe(direction) {
        if (blockSwipe || blackSlideActive) return;

        if (direction === 'left') {
            playRandomSound('left');
            leftSwipes++;
            if (leftSwipes >= SCARY_LEFT_THRESHOLD && !blackSlideActive) {
                triggerBlackSlide();
            }
        } else if (direction === 'right') {
            playRandomSound('right');
            rightSwipes++;
            checkRightWarning();
        }
    }

    // Drag swipe logic
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const SWIPE_THRESHOLD = 100;

    function onDragStart(e) {
        if (blockSwipe || blackSlideActive) return;
        e.preventDefault();
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        startX = clientX;
        isDragging = true;
        card.style.transition = 'none';
        nopeBadge.style.display = 'none';
        likeBadge.style.display = 'none';
    }

    function onDragMove(e) {
        if (!isDragging || blockSwipe) return;
        e.preventDefault();
        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        currentX = clientX - startX;

        let rotate = currentX * 0.1;
        rotate = Math.min(25, Math.max(-25, rotate));
        card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;

        if (currentX > 15) {
            likeBadge.style.display = 'block';
            nopeBadge.style.display = 'none';
        } else if (currentX < -15) {
            nopeBadge.style.display = 'block';
            likeBadge.style.display = 'none';
        } else {
            nopeBadge.style.display = 'none';
            likeBadge.style.display = 'none';
        }
    }

    function onDragEnd(e) {
        if (!isDragging || blockSwipe) return;
        e.preventDefault();
        isDragging = false;
        card.style.transition = 'transform 0.25s ease';

        if (Math.abs(currentX) > SWIPE_THRESHOLD) {
            if (currentX > 0) {
                handleSwipe('right');
            } else {
                handleSwipe('left');
            }
            card.style.transform = `translateX(${currentX > 0 ? 400 : -400}px) rotate(${currentX * 0.1}deg)`;
            setTimeout(() => {
                if (!blackSlideActive) {
                    card.style.transition = 'none';
                    card.style.transform = 'translateX(0) rotate(0)';
                    loadNextImage();
                    nopeBadge.style.display = 'none';
                    likeBadge.style.display = 'none';
                    setTimeout(() => {
                        card.style.transition = 'transform 0.2s ease';
                    }, 50);
                }
            }, 200);
        } else {
            card.style.transform = 'translateX(0) rotate(0)';
            nopeBadge.style.display = 'none';
            likeBadge.style.display = 'none';
        }
        startX = 0;
        currentX = 0;
    }

    // Event listeners
    card.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    card.addEventListener('touchstart', onDragStart, { passive: false });
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd);
    cardImg.addEventListener('dragstart', (e) => e.preventDefault());

    // Button events
    nopeBtn.addEventListener('click', () => {
        if (blockSwipe || blackSlideActive) return;
        playRandomSound('left');
        handleSwipe('left');
        card.style.transition = 'transform 0.2s';
        card.style.transform = 'translateX(-250px) rotate(-12deg)';
        setTimeout(() => {
            if (!blackSlideActive) {
                card.style.transition = 'none';
                card.style.transform = 'translateX(0) rotate(0)';
                loadNextImage();
            }
        }, 180);
    });

    likeBtn.addEventListener('click', () => {
        if (blockSwipe || blackSlideActive) return;
        playRandomSound('right');
        handleSwipe('right');
        card.style.transition = 'transform 0.2s';
        card.style.transform = 'translateX(250px) rotate(12deg)';
        setTimeout(() => {
            if (!blackSlideActive) {
                card.style.transition = 'none';
                card.style.transform = 'translateX(0) rotate(0)';
                loadNextImage();
            }
        }, 180);
    });

    superBtn.addEventListener('click', () => {
        if (blockSwipe || blackSlideActive) return;
        playRandomSound('super');
        rightSwipes++;
        showSuperGif();

        card.style.transition = 'transform 0.2s';
        card.style.transform = 'translateY(-200px) rotate(0)';
        setTimeout(() => {
            if (!blackSlideActive) {
                card.style.transition = 'none';
                card.style.transform = 'translateX(0) rotate(0)';
                loadNextImage();
            }
        }, 180);
    });

    // Fallback for autoplay
    function handleFirstInteraction() {
        if (bgMusic && bgMusic.paused) {
            bgMusic.play().catch(e => console.log('Still could not play music'));
        }
    }
    
    document.body.addEventListener('click', handleFirstInteraction, { once: true });
    document.body.addEventListener('touchstart', handleFirstInteraction, { once: true });
})();