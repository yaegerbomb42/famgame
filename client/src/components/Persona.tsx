import { motion } from 'framer-motion';
import { usePersona } from '../context/PersonaContext';

export const Persona = () => {
    const { isSpeaking } = usePersona();

    return (
        <div className="fixed top-4 left-4 z-50 pointer-events-none">
            <motion.div
                animate={isSpeaking ? "speaking" : "idle"}
                variants={{
                    idle: {
                        y: [0, -10, 0],
                        transition: {
                            repeat: Infinity,
                            duration: 3,
                            ease: "easeInOut"
                        }
                    },
                    speaking: {
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0],
                        transition: {
                            repeat: Infinity,
                            duration: 0.5,
                            ease: "easeInOut"
                        }
                    }
                }}
                className="relative w-16 h-16 md:w-24 md:h-24"
            >
                {/* Body */}
                <div className="absolute inset-0 bg-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] border-4 border-game-primary flex items-center justify-center overflow-hidden">
                    {/* Eyes */}
                    <div className="flex gap-4 mb-2">
                        <motion.div 
                            className="w-3 h-3 bg-black rounded-full"
                            animate={isSpeaking ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }}
                            transition={{ repeat: Infinity, duration: 0.2 }}
                        />
                        <motion.div 
                            className="w-3 h-3 bg-black rounded-full"
                            animate={isSpeaking ? { scaleY: [1, 0.2, 1] } : { scaleY: 1 }}
                            transition={{ repeat: Infinity, duration: 0.2, delay: 0.1 }}
                        />
                    </div>
                    
                    {/* Mouth */}
                    <div className="absolute bottom-6">
                        {isSpeaking ? (
                            <motion.div 
                                className="w-4 h-2 bg-black rounded-full"
                                animate={{ width: ["10px", "20px", "10px"], height: ["5px", "15px", "5px"] }}
                                transition={{ repeat: Infinity, duration: 0.2 }}
                            />
                        ) : (
                            <div className="w-4 h-1 bg-black rounded-full" />
                        )}
                    </div>
                </div>

                {/* Halo/Glow */}
                <motion.div 
                    className="absolute -inset-2 bg-game-primary rounded-full -z-10 opacity-30"
                    animate={isSpeaking ? { opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] } : { opacity: 0.3 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                />
            </motion.div>
            
            {/* Speech Bubble (Optional - could add later for subtitles) */}
        </div>
    );
};
