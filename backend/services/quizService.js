import Quizzes from '../models/Quizzes.js';
import { ChatGroq } from '@langchain/groq';
import { VectorDocument } from '../config/vectorDatabase.js';
import dotenv from 'dotenv';

dotenv.config();

class QuizService {
  constructor() {
    this.genAI = null;
    this.chatModel = null;
    this.initialize();
  }

  async initialize() {
    try {
      this.genAI = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: 'llama-3.1-70b-versatile'
      });
      this.chatModel = this.genAI;
      console.log('Quiz service initialized with Groq LLM');
    } catch (error) {
      console.error('Error initializing quiz service:', error);
      throw error;
    }
  }

  async createQuiz(quizData, createdBy) {
    try {
      const quiz = new Quizzes({
        ...quizData,
        createdBy,
        isGenerated: false
      });

      await quiz.save();
      return quiz;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw error;
    }
  }

  async generateQuizFromContent(content, unitId, sectionId, difficulty = 'medium') {
    try {
      const prompt = `
Generate a quiz based on the following educational content. Create 5-8 questions that test understanding of key concepts.

Content: "${content}"

Requirements:
1. Create a mix of multiple choice and true/false questions
2. Each question should have 4 options for multiple choice
3. Provide clear explanations for each answer
4. Set appropriate difficulty level: ${difficulty}
5. Ensure questions are educational and relevant to the content

Return the quiz in this JSON format:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "text": "Question text",
      "type": "multiple_choice",
      "options": [
        {"text": "Option A", "isCorrect": true},
        {"text": "Option B", "isCorrect": false},
        {"text": "Option C", "isCorrect": false},
        {"text": "Option D", "isCorrect": false}
      ],
      "explanation": "Detailed explanation",
      "difficulty": "${difficulty}"
    }
  ]
}`;

      const result = await this.chatModel.invoke([
        ['human', prompt]
      ]);

      const quizContent = JSON.parse(result.content);
      
      const quiz = new Quizzes({
        title: quizContent.title,
        description: quizContent.description,
        unitId,
        sectionId,
        questions: quizContent.questions,
        difficulty,
        isGenerated: true,
        createdBy: null // System generated
      });

      await quiz.save();
      return quiz;
    } catch (error) {
      console.error('Error generating quiz from content:', error);
      throw error;
    }
  }

  async generateQuizFromVectorContent(query, unitId, sectionId, difficulty = 'medium', numQuestions = 5) {
    try {
      // Search for relevant content in vector database
      const searchResults = await VectorDocument.find({})
        .limit(10)
        .lean();

      if (searchResults.length === 0) {
        throw new Error('No relevant content found in vector database');
      }

      // Combine relevant content
      const content = searchResults
        .map(doc => doc.content)
        .join(' ');

      return await this.generateQuizFromContent(content, unitId, sectionId, difficulty);
    } catch (error) {
      console.error('Error generating quiz from vector content:', error);
      throw error;
    }
  }

  async startQuiz(quizId, studentId) {
    try {
      // Get quiz details
      const quiz = await Quizzes.findById(quizId);
      if (!quiz || !quiz.isActive) {
        throw new Error('Quiz not found or inactive');
      }

      // Check if student already has an active attempt
      const activeAttempt = quiz.attempts.find(attempt => 
        attempt.studentId.toString() === studentId && 
        !attempt.isCompleted
      );

      if (activeAttempt) {
        return {
          quizId: quiz._id,
          quizTitle: quiz.title,
          unitId: quiz.unitId,
          sectionId: quiz.sectionId,
          timeLimit: quiz.timeLimit,
          difficulty: quiz.difficulty,
          attemptNumber: activeAttempt.attemptNumber,
          currentQuestionIndex: this.getCurrentQuestionIndex(activeAttempt),
          totalQuestions: quiz.questions.length,
          timeStarted: activeAttempt.timeStarted,
          answers: activeAttempt.answers
        };
      }

      // Create new attempt
      const attemptNumber = quiz.attempts.filter(a => a.studentId.toString() === studentId).length + 1;
      
      const newAttempt = {
        studentId,
        answers: [],
        totalScore: 0,
        maxScore: 0,
        percentage: 0,
        timeStarted: new Date(),
        timeCompleted: null,
        timeTaken: 0,
        isCompleted: false,
        attemptNumber,
        difficulty: quiz.difficulty
      };

      quiz.attempts.push(newAttempt);
      await quiz.save();

      return {
        quizId: quiz._id,
        quizTitle: quiz.title,
        unitId: quiz.unitId,
        sectionId: quiz.sectionId,
        timeLimit: quiz.timeLimit,
        difficulty: quiz.difficulty,
        attemptNumber: newAttempt.attemptNumber,
        currentQuestionIndex: 0,
        totalQuestions: quiz.questions.length,
        timeStarted: newAttempt.timeStarted,
        answers: []
      };
    } catch (error) {
      console.error('Error starting quiz:', error);
      throw error;
    }
  }

  getCurrentQuestionIndex(attempt) {
    const answeredQuestions = attempt.answers.filter(a => a.questionId).length;
    return Math.min(answeredQuestions, attempt.answers.length);
  }

  async answerQuestion(quizId, studentId, questionIndex, answer) {
    try {
      const quiz = await Quizzes.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const attempt = quiz.attempts.find(a => 
        a.studentId.toString() === studentId && 
        !a.isCompleted
      );

      if (!attempt) {
        throw new Error('No active attempt found');
      }

      const question = quiz.questions[questionIndex];
      if (!question) {
        throw new Error('Invalid question index');
      }

      // Check if answer already exists for this question
      let answerObj = attempt.answers.find(a => a.questionId.toString() === question._id.toString());
      
      if (!answerObj) {
        answerObj = {
          questionId: question._id,
          questionText: question.text,
          questionType: question.type,
          selectedAnswer: null,
          shortAnswer: null,
          isCorrect: false,
          pointsAwarded: 0,
          timeSpent: 0
        };
        attempt.answers.push(answerObj);
      }

      // Record the answer
      if (question.type === 'short_answer') {
        answerObj.shortAnswer = answer;
      } else {
        answerObj.selectedAnswer = answer;
        
        // Check if answer is correct
        const correctOption = question.options.find(opt => opt.isCorrect);
        if (correctOption) {
          answerObj.isCorrect = answerObj.selectedAnswer === correctOption.text;
        }
      }

      // Update score
      if (answerObj.isCorrect) {
        answerObj.pointsAwarded = question.points || 1;
      }

      // Update attempt scores
      attempt.totalScore = attempt.answers.reduce((sum, a) => sum + a.pointsAwarded, 0);
      attempt.maxScore = quiz.questions.length;
      attempt.percentage = attempt.maxScore > 0 ? Math.round((attempt.totalScore / attempt.maxScore) * 100) : 0;

      await quiz.save();

      return {
        question: {
          questionIndex,
          questionId: question._id,
          text: question.text,
          type: question.type,
          options: question.options,
          isAnswered: true,
          isCorrect: answerObj.isCorrect
        },
        sessionProgress: {
          currentQuestionIndex: this.getCurrentQuestionIndex(attempt),
          totalQuestions: quiz.questions.length,
          answeredQuestions: attempt.answers.filter(a => a.questionId).length
        }
      };
    } catch (error) {
      console.error('Error answering question:', error);
      throw error;
    }
  }

  async submitQuiz(quizId, studentId) {
    try {
      const quiz = await Quizzes.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const attempt = quiz.attempts.find(a => 
        a.studentId.toString() === studentId && 
        !a.isCompleted
      );

      if (!attempt) {
        throw new Error('No active attempt found');
      }

      // Mark as completed
      attempt.isCompleted = true;
      attempt.timeCompleted = new Date();
      attempt.timeTaken = attempt.timeCompleted - attempt.timeStarted;

      // Calculate final scores
      const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
      const totalQuestions = quiz.questions.length;
      
      attempt.totalScore = correctAnswers;
      attempt.maxScore = totalQuestions;
      attempt.percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

      await quiz.save();

      return {
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        isPassed: attempt.percentage >= 60,
        timeTaken: attempt.timeTaken,
        answers: attempt.answers
      };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      throw error;
    }
  }

  async getQuizResults(quizId, studentId) {
    try {
      const quiz = await Quizzes.findById(quizId)
        .populate('unitId', 'title')
        .populate('sectionId', 'title')
        .populate('createdBy', 'username');

      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const attempt = quiz.attempts.find(a => 
        a.studentId.toString() === studentId && 
        a.isCompleted
      );

      if (!attempt) {
        throw new Error('No completed attempt found');
      }

      return {
        quizId: quiz._id,
        quizTitle: quiz.title,
        studentId: attempt.studentId,
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        isPassed: attempt.percentage >= 60,
        timeTaken: attempt.timeTaken,
        answers: attempt.answers,
        timeStarted: attempt.timeStarted,
        timeCompleted: attempt.timeCompleted,
        attemptNumber: attempt.attemptNumber
      };
    } catch (error) {
      console.error('Error getting quiz results:', error);
      throw error;
    }
  }

  async getStudentProgress(studentId) {
    try {
      const quizzes = await Quizzes.find({
        'attempts.studentId': studentId,
        'attempts.isCompleted': true
      });

      const attempts = [];
      for (const quiz of quizzes) {
        const completedAttempts = quiz.attempts.filter(a => 
          a.studentId.toString() === studentId && 
          a.isCompleted
        );
        attempts.push(...completedAttempts.map(attempt => ({
          quizId: quiz._id,
          quizTitle: quiz.title,
          unitId: quiz.unitId,
          sectionId: quiz.sectionId,
          ...attempt
        })));
      }

      const progress = {
        totalQuizzes: attempts.length,
        completedQuizzes: attempts.filter(a => a.isCompleted).length,
        averageScore: 0,
        bestScore: 0,
        weakestAreas: [],
        strongestAreas: [],
        recentAttempts: attempts.slice(0, 5)
      };

      if (attempts.length > 0) {
        const scores = attempts.map(a => a.percentage);
        progress.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        progress.bestScore = Math.max(...scores);
      }

      return progress;
    } catch (error) {
      console.error('Error getting student progress:', error);
      throw error;
    }
  }

  async getQuizAnalytics(quizId) {
    try {
      const quiz = await Quizzes.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const attempts = quiz.attempts.filter(a => a.isCompleted);

      if (attempts.length === 0) {
        return {
          totalAttempts: 0,
          averageScore: 0,
          passRate: 0,
          bestScore: 0,
          worstScore: 0,
          averageTime: 0
        };
      }

      const scores = attempts.map(a => a.percentage);
      const times = attempts.map(a => a.timeTaken);

      return {
        totalAttempts: attempts.length,
        averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        passRate: Math.round((attempts.filter(a => a.percentage >= 60).length / attempts.length) * 100),
        bestScore: Math.max(...scores),
        worstScore: Math.min(...scores),
        averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      };
    } catch (error) {
      console.error('Error getting quiz analytics:', error);
      throw error;
    }
  }

  async getQuizById(quizId) {
    try {
      const quiz = await Quizzes.findById(quizId)
        .populate('unitId', 'title')
        .populate('sectionId', 'title')
        .populate('createdBy', 'username');
      
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      return quiz;
    } catch (error) {
      console.error('Error getting quiz:', error);
      throw error;
    }
  }

  async getQuizzesByUnit(unitId) {
    try {
      const quizzes = await Quizzes.findByUnit(unitId);
      return quizzes;
    } catch (error) {
      console.error('Error getting quizzes by unit:', error);
      throw error;
    }
  }

  async getQuizzesBySection(sectionId) {
    try {
      const quizzes = await Quizzes.findBySection(sectionId);
      return quizzes;
    } catch (error) {
      console.error('Error getting quizzes by section:', error);
      throw error;
    }
  }

  async updateQuiz(quizId, updateData) {
    try {
      const quiz = await Quizzes.findByIdAndUpdate(
        quizId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!quiz) {
        throw new Error('Quiz not found');
      }

      return quiz;
    } catch (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }
  }

  async deleteQuiz(quizId) {
    try {
      const quiz = await Quizzes.findByIdAndDelete(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      return { message: 'Quiz deleted successfully' };
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }
}

export default new QuizService();