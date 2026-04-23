import { AIGenerator } from './server/src/utils/AIGenerator';

async function testTrivia() {
    console.log('Testing Trivia Generation...');
    const questions = await AIGenerator.generateTrivia('90s Video Games', 2);
    console.log('Result:', JSON.stringify(questions, null, 2));
}

testTrivia();
