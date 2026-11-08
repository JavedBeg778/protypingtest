// Official Criteria for Verified Skill Certificates
const CERT_CRITERIA = {
    'bronze': {
        name: 'Bronze Certificate',
        minWpm: 25,
        minAccuracy: 85,
        durationSec: 120,
        minChars: 250 // Minimum reasonable keystrokes
    },
    'silver': {
        name: 'Silver Certificate',
        minWpm: 40,
        minAccuracy: 90,
        durationSec: 180,
        minChars: 600
    },
    'gold': {
        name: 'Gold Certificate',
        minWpm: 60,
        minAccuracy: 95,
        durationSec: 300,
        minChars: 1500
    },
    'platinum': {
        name: 'Platinum Certificate',
        minWpm: 80,
        minAccuracy: 97,
        durationSec: 300,
        minChars: 2000
    },
    'diamond': {
        name: 'Diamond Certificate',
        minWpm: 100,
        minAccuracy: 98,
        durationSec: 300,
        minChars: 2500
    },
    'master': {
        name: 'Master Certificate',
        minWpm: 120,
        minAccuracy: 99,
        durationSec: 600,
        minChars: 6000
    }
};

// Official Server-Issued Challenge Texts per Level
const CERT_CHALLENGES = {
    'bronze': [
        "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Typing is a valuable foundational skill in today's digital environment. It empowers you to communicate rapidly and express your thoughts with clarity and confidence. Consistent daily practice with proper home-row hand positioning creates permanent spatial keyboard memory.",
        "Learning to type properly takes patience and deliberate technique. The fundamental principle of touch typing is to focus strictly on precision before accelerating raw cadence. As each finger learns its dedicated keys, muscle memory gradually replaces conscious visual searching, producing steady and effortless keyboard fluency."
    ],
    'silver': [
        "Learning to type properly takes time and focused discipline. The key to sustainable progress is prioritizing accuracy over velocity, allowing rhythm and speed to emerge naturally as neuromuscular pathways solidify. Ergonomics plays an indispensable role in maintaining speed: keeping straight wrists, curved fingers, and relaxed shoulders prevents physical tension and carpal fatigue during extended practice.",
        "Touch typing enables individuals to draft documents, code applications, and answer correspondence without ever glancing downward at the keyboard. This sensory mastery dramatically elevates productivity by freeing cognitive bandwidth for creative analysis, critical problem solving, and articulate self-expression."
    ],
    'gold': [
        "The evolution of keyboard interfaces traces back to mechanical typewriters of the nineteenth century. Today, proficient keyboarding represents an indispensable capability across legal, administrative, software engineering, and governmental occupations. Standard international benchmarking measures speed in words per minute, defining one standard word unit as five discrete key actuations including punctuation and spacing.",
        "Maintaining deliberate neuromuscular control under timed examination conditions demands mental poise and mechanical consistency. Typists preparing for civil service examinations must practice sustained prose passages rather than isolated words. A disciplined five-minute assessment requires continuous optical buffering, look-ahead word chunking, and immediate tactile error detection to ensure high net accuracy."
    ],
    'platinum': [
        "Cognitive psychology demonstrates that automated motor skills free neurological capacity for higher-order reasoning. When a typist achieves eighty words per minute with ninety-seven percent accuracy, keystroke execution occurs autonomously at the subconscious level. Thoughts translate directly into visible syntax without conscious mechanical friction, accelerating written communication in fast-paced professional workflows.",
        "The QWERTY configuration was originally devised to minimize mechanical jam frequencies in typewriters, yet it endured to become the universal computing standard. Mastery of this layout at high velocity requires exceptional bilateral finger coordination, precise index finger homing on the F and J nubs, and subtle wrist pivoting rather than isolated digit hyper-extension."
    ],
    'diamond': [
        "Elite transcription performance exceeding one hundred words per minute requires years of disciplined training and exceptional eye-hand coordination. At this tier, typists buffer multiple future words in working memory while fingers simultaneously actuate the current syllable sequence. Millisecond variations in switch actuation dictate performance, requiring balanced tactile rhythm and total physical relaxation.",
        "Precision at extreme velocity demands that uncorrected errors be ruthlessly minimized. Because official examination protocols penalize inaccuracies through full-word deductions, a single lapse in concentration can dismantle a competitive score. High-performance typists treat every sentence as a continuous melodic cadence, balancing speed bursts against rhythmic stability."
    ],
    'master': [
        "Transcribing at one hundred and twenty words per minute represents the summit of computer keyboard fluency. Achieving ninety-nine percent accuracy across a ten-minute examination requires profound physical stamina, uncompromising home-row adherence, and unflinching mental focus. At this mastery tier, keyboard transcription ceases to be a manual task and becomes an instantaneous conduit between human consciousness and digital documentation.",
        "The distinction between amateur typing and master-tier transcription lies in the eradication of hesitations between complex linguistic bigrams. By drilling thousands of pages of authentic legal, technical, and literary prose, the master typist develops automated kinetic schemas for every conceivable orthographic combination, achieving near-perfect fidelity at maximum mechanical velocity."
    ]
};

module.exports = {
    CERT_CRITERIA,
    CERT_CHALLENGES
};
