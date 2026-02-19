import quizService from '../services/quizService.js';
import { protect } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv'
dotenv.config() 

class QuizController {
  async createQuiz(req, res) {
    try {
      const { title, description, unitId, sectionId, questions, timeLimit, difficulty } = req.body;
      const createdBy = req.user.id;

      const quizData = {
        title,
        description,
        unitId,
        sectionId,
        questions,
        timeLimit,
        difficulty
      };

      const quiz = await quizService.createQuiz(quizData, createdBy);

      res.status(201).json({
        success: true,
        message: 'Quiz created successfully',
        quiz
      });
    } catch (error) {
      console.error('Error creating quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating quiz',
        error: error.message
      });
    }
  }

  async generateQuizFromContent(req, res) {
    try {
      const { content, unitId, sectionId, difficulty } = req.body;

      if (!content || !unitId) {
        return res.status(400).json({
          success: false,
          message: 'Content and unitId are required'
        });
      }

      const quiz = await quizService.generateQuizFromContent(content, unitId, sectionId, difficulty);

      res.status(201).json({
        success: true,
        message: 'Quiz generated successfully',
        quiz
      });
    } catch (error) {
      console.error('Error generating quiz from content:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating quiz',
        error: error.message
      });
    }
  }

  async generateQuizFromVector(req, res) {
    try {
      const { query, unitId, sectionId, difficulty, numQuestions } = req.body;

      if (!query || !unitId) {
        return res.status(400).json({
          success: false,
          message: 'Query and unitId are required'
        });
      }

      const quiz = await quizService.generateQuizFromVectorContent(
        query, 
        unitId, 
        sectionId, 
        difficulty, 
        numQuestions
      );

      res.status(201).json({
        success: true,
        message: 'Quiz generated from vector content successfully',
        quiz
      });
    } catch (error) {
      console.error('Error generating quiz from vector content:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating quiz from vector content',
        error: error.message
      });
    }
  }

  async startQuiz(req, res) {
    try {
      const { quizId } = req.body;
      const studentId = req.user.id;

      if (!quizId) {
        return res.status(400).json({
          success: false,
          message: 'Quiz ID is required'
        });
      }

      const session = await quizService.startQuiz(quizId, studentId);

      res.status(200).json({
        success: true,
        message: 'Quiz started successfully',
        session: {
          quizId: session.quizId,
          quizTitle: session.quizTitle,
          unitId: session.unitId,
          sectionId: session.sectionId,
          timeLimit: session.timeLimit,
          difficulty: session.difficulty,
          attemptNumber: session.attemptNumber,
          currentQuestionIndex: session.currentQuestionIndex,
          totalQuestions: session.totalQuestions,
          timeStarted: session.timeStarted,
          answers: session.answers
        }
      });
    } catch (error) {
      console.error('Error starting quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error starting quiz',
        error: error.message
      });
    }
  }

  async getQuestion(req, res) {
    try {
      const { quizId, questionIndex } = req.params;
      const studentId = req.user.id;

      const quiz = await quizService.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({
          success: false,
          message: 'Quiz not found'
        });
      }

      const question = quiz.questions[parseInt(questionIndex)];
      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found'
        });
      }

      res.status(200).json({
        success: true,
        question: {
          questionIndex: parseInt(questionIndex),
          questionId: question._id,
          text: question.text,
          type: question.type,
          options: question.options,
          explanation: question.explanation
        }
      });
    } catch (error) {
      console.error('Error getting question:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting question',
        error: error.message
      });
    }
  }

  async answerQuestion(req, res) {
    try {
      const { quizId, questionIndex } = req.params;
      const { answer } = req.body;
      const studentId = req.user.id;

      if (!answer) {
        return res.status(400).json({
          success: false,
          message: 'Answer is required'
        });
      }

      const result = await quizService.answerQuestion(quizId, studentId, parseInt(questionIndex), answer);

      res.status(200).json({
        success: true,
        message: 'Answer recorded successfully',
        question: result.question,
        sessionProgress: result.sessionProgress
      });
    } catch (error) {
      console.error('Error answering question:', error);
      res.status(500).json({
        success: false,
        message: 'Error answering question',
        error: error.message
      });
    }
  }

  async submitQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const studentId = req.user.id;

      const result = await quizService.submitQuiz(quizId, studentId);

      res.status(200).json({
        success: true,
        message: 'Quiz submitted successfully',
        results: result
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting quiz',
        error: error.message
      });
    }
  }

  async getQuizResults(req, res) {
    try {
      const { quizId } = req.params;
      const studentId = req.user.id;

      const results = await quizService.getQuizResults(quizId, studentId);

      res.status(200).json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Error getting quiz results:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting quiz results',
        error: error.message
      });
    }
  }

  async getStudentProgress(req, res) {
    try {
      const studentId = req.user.id;

      const progress = await quizService.getStudentProgress(studentId);

      res.status(200).json({
        success: true,
        progress
      });
    } catch (error) {
      console.error('Error getting student progress:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting student progress',
        error: error.message
      });
    }
  }

  async getQuizAnalytics(req, res) {
    try {
      const { quizId } = req.params;

      const analytics = await quizService.getQuizAnalytics(quizId);

      res.status(200).json({
        success: true,
        analytics
      });
    } catch (error) {
      console.error('Error getting quiz analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting quiz analytics',
        error: error.message
      });
    }
  }

  async getQuizById(req, res) {
    try {
      const { quizId } = req.params;

      const quiz = await quizService.getQuizById(quizId);

      res.status(200).json({
        success: true,
        quiz
      });
    } catch (error) {
      console.error('Error getting quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting quiz',
        error: error.message
      });
    }
  }

  async getQuizzesByUnit(req, res) {
    try {
      const { unitId } = req.params;

      const quizzes = await quizService.getQuizzesByUnit(unitId);

      res.status(200).json({
        success: true,
        quizzes
      });
    } catch (error) {
      console.error('Error getting quizzes by unit:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting quizzes by unit',
        error: error.message
      });
    }
  }

  async getQuizzesBySection(req, res) {
    try {
      const { sectionId } = req.params;

      const quizzes = await quizService.getQuizzesBySection(sectionId);

      res.status(200).json({
        success: true,
        quizzes
      });
    } catch (error) {
      console.error('Error getting quizzes by section:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting quizzes by section',
        error: error.message
      });
    }
  }

  async updateQuiz(req, res) {
    try {
      const { quizId } = req.params;
      const updateData = req.body;

      const quiz = await quizService.updateQuiz(quizId, updateData);

      res.status(200).json({
        success: true,
        message: 'Quiz updated successfully',
        quiz
      });
    } catch (error) {
      console.error('Error updating quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating quiz',
        error: error.message
      });
    }
  }

  async deleteQuiz(req, res) {
    try {
      const { quizId } = req.params;

      const result = await quizService.deleteQuiz(quizId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting quiz',
        error: error.message
      });
    }
  }
}

export default new QuizController();