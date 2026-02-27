// insertSampleData.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Import all models (adjust paths to your actual files)
import Books from './models/Books.js';
import Units from './models/Units.js';
import Sections from './models/Sections.js';
import Users from './models/Users.js';
import ChatSessions from './models/ChatSessions.js';
import Interactions from './models/Interactions.js';
import Quizzes from './models/Quizzes.js';
import Resources from './models/Resources.js';
import References from './models/References.js';
import StudentProgress from './models/StudentProgress.js';
import PaymentAccount from './models/PaymentAccount.js';
import PremiumPlan from './models/PremiumPlan.js';
import PaymentTransaction from './models/PaymentTransaction.js';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/fsr_db';

async function insertSampleData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // ---------- 1. Create a Book ----------
    const book = await Books.create({
      gradeLevel: 'G-9',
      subject: 'Mathematics',
      totalPages: 300,
      toc: ['Chapter 1', 'Chapter 2'],
      summary: 'A sample math book',
      filePath: '/uploads/math_g9.pdf',
      yearOfPublish: '2023'
    });
    console.log('Book created:', book.title);

    // ---------- 2. Create Units under the Book ----------
    const unit1 = await Units.create({
      bookId: book._id,
      unitNumber: 1,
      title: 'Algebra Basics',
      startingPage: 1,
      endingPage: 50,
      summary: 'Introduction to algebra'
    });
    const unit2 = await Units.create({
      bookId: book._id,
      unitNumber: 2,
      title: 'Geometry',
      startingPage: 51,
      endingPage: 120,
      summary: 'Basics of geometry'
    });
    console.log('Units created');

    // ---------- 3. Create Sections (with hierarchy) ----------
    // Top-level section under unit1
    const section1 = await Sections.create({
      unitId: unit1._id,
      sectionNumber: '1.1',
      parentSectionId: null,
      headingLevel: 1,
      title: 'Variables and Expressions',
      startingPage: 1,
      endingPage: 10,
      content: 'Content about variables...',
      aiClarification: 'Variables are symbols that represent numbers.',
      summary: 'Introduction to variables'
    });

    // Subsection under section1
    const subsection1 = await Sections.create({
      unitId: unit1._id,
      sectionNumber: '1.1.1',
      parentSectionId: section1._id,
      headingLevel: 2,
      title: 'Evaluating Expressions',
      startingPage: 5,
      endingPage: 8,
      content: 'How to evaluate expressions...',
      aiClarification: 'Plug in values for variables.',
      summary: 'Evaluation techniques'
    });

    // Another top-level section under unit2
    const section2 = await Sections.create({
      unitId: unit2._id,
      sectionNumber: '2.1',
      parentSectionId: null,
      headingLevel: 1,
      title: 'Points and Lines',
      startingPage: 51,
      endingPage: 70,
      content: 'Basics of coordinate geometry...',
      aiClarification: 'Points are locations, lines are infinite.',
      summary: 'Intro to coordinate geometry'
    });
    console.log('Sections created');

    // ---------- 4. Create Users (student and admin) ----------
    const student = await Users.create({
      username: 'john_doe',
      password: 'password123', // will be hashed by pre-save hook
      role: 'student'
    });
    const admin = await Users.create({
      username: 'admin',
      password: 'adminpass',
      role: 'admin'
    });
    console.log('Users created');

    // ---------- 5. Create Chat Sessions ----------
    const chatSessionInteraction = await ChatSessions.create({
      studentId: student._id,
      type: 'interaction',
      summary: 'Questions about algebra'
    });
    const chatSessionQuiz = await ChatSessions.create({
      studentId: student._id,
      type: 'quiz',
      summary: 'Algebra quiz'
    });
    console.log('Chat sessions created');

    // ---------- 6. Create Interactions ----------
    const interaction1 = await Interactions.create({
      sectionId: section1._id,
      chatSessionId: chatSessionInteraction._id,
      studentId: student._id,
      studentQuestion: 'What is a variable?',
      aiAnswer: 'A variable is a symbol that represents an unknown value.',
      confidenceScore: 0.95
    });
    const interaction2 = await Interactions.create({
      sectionId: subsection1._id,
      chatSessionId: chatSessionInteraction._id,
      studentId: student._id,
      studentQuestion: 'How do I evaluate 2x+3 when x=5?',
      aiAnswer: 'Substitute 5 for x: 2*5+3 = 10+3 = 13.',
      confidenceScore: 0.98
    });
    console.log('Interactions created');

    // ---------- 7. Create Quizzes ----------
    const quiz1 = await Quizzes.create({
      chatSessionId: chatSessionQuiz._id,
      question: { text: 'What is 2+2?' },
      choices: ['3', '4', '5', '6'],
      answer: '4',
      explanation: 'Basic addition',
      studentAttempt: '4'
    });
    const quiz2 = await Quizzes.create({
      chatSessionId: chatSessionQuiz._id,
      question: { text: 'Solve for x: x+3=7' },
      choices: ['3', '4', '5', '10'],
      answer: '4',
      explanation: 'Subtract 3 from both sides.',
      studentAttempt: '4'
    });
    console.log('Quizzes created');

    // ---------- 8. Create Resources ----------
    // Resource linked to section (no interactionId)
    const resourceSection = await Resources.create({
      sectionId: section1._id,
      interactionId: null,
      title: 'Khan Academy - Variables',
      description: 'Video on variables',
      type: 'youtube',
      link: 'https://www.youtube.com/watch?v=dummy1'
    });
    // Resource linked to interaction (no sectionId)
    const resourceInteraction = await Resources.create({
      sectionId: null,
      interactionId: interaction1._id,
      title: 'Variable Definition Article',
      description: 'Detailed article about variables',
      type: 'article',
      link: 'https://example.com/variables'
    });
    console.log('Resources created');

    // ---------- 9. Create References ----------
    // Reference linked to interaction
    const refInteraction = await References.create({
      interactionId: interaction1._id,
      quizId: null,
      bookId: null,
      quotedText: 'A variable is a symbol that represents a quantity.',
      pageNumber: 2,
      lineFrom: 5,
      lineTo: 6
    });
    // Reference linked to quiz
    const refQuiz = await References.create({
      interactionId: null,
      quizId: quiz1._id,
      bookId: null,
      quotedText: '2+2 equals 4',
      pageNumber: 3,
      lineFrom: 1,
      lineTo: 1
    });
    // Reference linked to book
    const refBook = await References.create({
      interactionId: null,
      quizId: null,
      bookId: book._id,
      quotedText: 'Mathematics is the study of numbers and patterns.',
      pageNumber: 1,
      lineFrom: 10,
      lineTo: 12
    });
    console.log('References created');

    // ---------- 10. Create Student Progress ----------
    await StudentProgress.create({
      studentId: student._id,
      sectionId: section1._id,
      status: 'completed'
    });
    await StudentProgress.create({
      studentId: student._id,
      sectionId: subsection1._id,
      status: 'in progress'
    });
    console.log('Student progress created');

    // ---------- 11. Create Payment Account ----------
    const paymentAccount = await PaymentAccount.create({
      accountNumber: '100023456789',
      accountHolderFullName: 'Ethio Learning Center',
      bankName: 'CBE',
      isActive: true
    });
    console.log('Payment account created');

    // ---------- 12. Create Premium Plan ----------
    const premiumPlan = await PremiumPlan.create({
      planName: 'Monthly Premium',
      description: 'Access to quizzes and AI assistant',
      amount: 9.99,
      durationDays: 30,
      features: ['Unlimited quizzes', 'AI chat', 'Progress tracking']
    });
    console.log('Premium plan created');

    // ---------- 13. Create Payment Transaction ----------
    await PaymentTransaction.create({
      transactionId: 'TXN123456',
      studentId: student._id,
      planId: premiumPlan._id,
      senderName: 'John Doe',
      senderAccountNumber: '1234567890',
      recipientName: paymentAccount.accountHolderFullName,
      recipientAccountNumber: paymentAccount.accountNumber,
      paidAmount: 9.99,
      paymentDate: new Date(),
      screenshotPath: '/uploads/screenshots/txn123456.png',
      verificationStatus: 'approved',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days later
    });
    console.log('Payment transaction created');

    console.log('All sample data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

insertSampleData();