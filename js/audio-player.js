// Audio Player for Urdu Pronunciation
// This handles all audio playback functionality

// Audio player state
let currentAudio = null;
let audioCache = {};

/**
 * Play audio file for pronunciation
 * @param {string} audioFile - Filename of the audio to play
 */
function playAudio(audioFile) {
    // Stop current audio if playing
    if (currentAudio && !currentAudio.paused) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Check if audio is cached
    if (audioCache[audioFile]) {
        currentAudio = audioCache[audioFile];
        currentAudio.currentTime = 0;
        currentAudio.play();
        return;
    }

    // Create new audio element
    const audio = new Audio(`audio/${audioFile}`);
    
    // Handle audio loading
    audio.addEventListener('loadeddata', function() {
        audioCache[audioFile] = audio;
        currentAudio = audio;
        audio.play();
    });

    // Handle errors
    audio.addEventListener('error', function() {
        console.warn(`Audio file not found: ${audioFile}`);
        // Fallback to text-to-speech if audio file doesn't exist
        speakUrdu(audioFile);
    });
}

/**
 * Text-to-speech fallback for missing audio files
 * @param {string} text - Text to speak
 */
function speakUrdu(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to find Urdu voice, fallback to Hindi or English
        const voices = window.speechSynthesis.getVoices();
        const urduVoice = voices.find(voice => 
            voice.lang.includes('ur') || 
            voice.lang.includes('hi') || 
            voice.name.includes('Urdu')
        );
        
        if (urduVoice) {
            utterance.voice = urduVoice;
        }
        
        utterance.rate = 0.8; // Slower for learning
        utterance.pitch = 1;
        
        window.speechSynthesis.speak(utterance);
    } else {
        console.warn('Text-to-speech not supported');
        alert('Audio playback is not available. Please ensure audio files are uploaded to the audio/ directory.');
    }
}

/**
 * Preload commonly used audio files
 */
function preloadAudio() {
    const commonWords = [
        'assalam.mp3',
        'shukriya.mp3',
        'haan.mp3',
        'nahi.mp3',
        'paani.mp3'
    ];

    commonWords.forEach(file => {
        const audio = new Audio(`audio/${file}`);
        audio.addEventListener('loadeddata', function() {
            audioCache[file] = audio;
        });
    });
}

/**
 * Play audio for a specific vocabulary row
 * @param {string} urduText - Urdu text to pronounce
 * @param {string} audioFile - Audio filename
 */
function playVocabAudio(urduText, audioFile) {
    playAudio(audioFile);
    
    // Visual feedback
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = '▶️ Playing...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1000);
}

/**
 * Play audio in sequence for practice
 * @param {Array} audioFiles - Array of audio files to play
 * @param {number} delay - Delay between audio in ms
 */
function playSequence(audioFiles, delay = 1000) {
    let index = 0;
    
    function playNext() {
        if (index < audioFiles.length) {
            playAudio(audioFiles[index]);
            index++;
            
            if (currentAudio) {
                currentAudio.addEventListener('ended', () => {
                    setTimeout(playNext, delay);
                });
            } else {
                setTimeout(playNext, delay + 1000);
            }
        }
    }
    
    playNext();
}

/**
 * Add audio controls to vocabulary tables
 */
function initAudioControls() {
    // Add play all button to vocabulary sections
    const vocabSections = document.querySelectorAll('.vocab-section');
    
    vocabSections.forEach(section => {
        const playAllBtn = document.createElement('button');
        playAllBtn.className = 'btn-primary';
        playAllBtn.textContent = '🔊 Play All Words';
        playAllBtn.onclick = function() {
            const audioButtons = section.querySelectorAll('.audio-btn');
            const audioFiles = Array.from(audioButtons).map(btn => 
                btn.getAttribute('onclick').match(/playAudio\('(.+)'\)/)[1]
            );
            playSequence(audioFiles, 2000);
        };
        
        section.insertBefore(playAllBtn, section.firstChild);
    });
}

/**
 * Add keyboard shortcuts for audio playback
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Space bar to replay last audio
        if (e.code === 'Space' && e.ctrlKey && currentAudio) {
            e.preventDefault();
            currentAudio.currentTime = 0;
            currentAudio.play();
        }
        
        // Ctrl+S to stop audio
        if (e.code === 'KeyS' && e.ctrlKey && currentAudio) {
            e.preventDefault();
            currentAudio.pause();
        }
    });
}

/**
 * Create practice mode with random audio
 */
function startPracticeMode(category) {
    // Get all vocabulary from category
    const vocabItems = getVocabularyByCategory(category);
    let currentIndex = 0;
    
    function playRandomWord() {
        if (currentIndex < vocabItems.length) {
            const item = vocabItems[currentIndex];
            playAudio(item.audioFile);
            
            // Show question
            setTimeout(() => {
                const answer = prompt(`What does this word mean?\n\nHint: ${item.urdu}`);
                if (answer && answer.toLowerCase() === item.english.toLowerCase()) {
                    alert('✅ Correct! Great job!');
                } else {
                    alert(`❌ Not quite. The answer is: ${item.english}`);
                }
                
                currentIndex++;
                if (currentIndex < vocabItems.length) {
                    setTimeout(playRandomWord, 1000);
                }
            }, 2000);
        }
    }
    
    playRandomWord();
}

/**
 * Download audio files guide
 */
function showAudioDownloadGuide() {
    const guide = `
    📥 How to Add Audio Files:
    
    1. Create an 'audio' folder in your project
    2. Record or download Urdu pronunciations
    3. Name files exactly as specified in vocabulary.csv
    4. Supported formats: .mp3, .wav, .ogg
    
    💡 Free Audio Resources:
    - Forvo.com - Native speaker pronunciations
    - Text-to-Speech services
    - Record your own pronunciations
    - Google Translate audio
    
    The system will automatically use these audio files when available,
    or fall back to browser text-to-speech.
    `;
    
    console.log(guide);
    return guide;
}

// Initialize audio system when page loads
document.addEventListener('DOMContentLoaded', function() {
    preloadAudio();
    initKeyboardShortcuts();
    
    // Load voices for text-to-speech
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = function() {
            const voices = window.speechSynthesis.getVoices();
            console.log('Available voices:', voices.filter(v => 
                v.lang.includes('ur') || v.lang.includes('hi')
            ));
        };
    }
    
    // Log audio setup guide
    console.log(showAudioDownloadGuide());
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        playAudio,
        speakUrdu,
        playSequence,
        startPracticeMode
    };
}