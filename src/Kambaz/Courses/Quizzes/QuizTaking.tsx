import { Container, Button, Card, Row, Col, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import * as quizzesClient from './client';
import './QuizTaking.css';

export default function QuizTaking() {
  const { cid, qid } = useParams<{ cid: string; qid: string }>();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: any }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === "FACULTY") {
      navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`);
      return;
    }
  }, [currentUser, cid, qid, navigate]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const [quizData, questionsData] = await Promise.all([
          quizzesClient.fetchQuiz(qid!),
          quizzesClient.fetchQuestions(qid!)
        ]);
        if (currentUser?.role === "STUDENT" && !quizData.published) {
          console.warn('Quiz is not published yet');
        }
        
        setQuiz(quizData);
        setQuestions(questionsData);
        setTimeRemaining((quizData.timeLimit || 20) * 60); 
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz data:', error);
        setLoading(false);
      }
    };

    if (qid) {
      fetchQuizData();
    }
  }, [qid, currentUser, cid, navigate]);

  useEffect(() => {
    if (quizStarted && timeRemaining > 0 && !quizSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeRemaining, quizSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  const handleSubmitQuiz = async () => {
    try {
      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(answers).length;
      if (answeredQuestions < totalQuestions) {
        const confirmed = window.confirm(
          `You have answered ${answeredQuestions} out of ${totalQuestions} questions. ` +
          'Are you sure you want to submit the quiz?'
        );
        if (!confirmed) return;
      }
      console.log('Submitting quiz answers:', {
        quizId: qid,
        answers,
        timeSpent: ((quiz.timeLimit || 20) * 60) - timeRemaining,
        submittedAt: new Date().toISOString()
      });
      setQuizSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <Container className="py-4">
        <div>Loading quiz...</div>
      </Container>
    );
  }
  if (!quiz) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <h4>Quiz not found</h4>
          <p>The quiz you're looking for doesn't exist or has been removed.</p>
          <Button variant="primary" onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}>
            Back to Quizzes
          </Button>
        </Alert>
      </Container>
    );
  }

  if (questions.length === 0 && !loading) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <h4>No Questions Available</h4>
          <p>This quiz doesn't have any questions yet.</p>
          <Button variant="primary" onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}>
            Back to Quizzes
          </Button>
        </Alert>
      </Container>
    );
  }
  if (quizSubmitted) {
    const answeredQuestions = Object.keys(answers).length;
    const totalQuestions = questions.length;
    
    return (
      <Container className="py-4">
        <Card>
          <Card.Body className="text-center">
            <div className="text-success mb-3">
              <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
            </div>
            <h3 className="text-success">Quiz Submitted Successfully!</h3>
            <p className="lead">Your answers have been recorded.</p>
            
            <div className="mt-4 p-3 bg-light rounded">
              <h5>Submission Summary</h5>
              <Row className="mt-3">
                <Col md={6}>
                  <p><strong>Quiz:</strong> {quiz.title}</p>
                  <p><strong>Questions Answered:</strong> {answeredQuestions} of {totalQuestions}</p>
                  <p><strong>Time Used:</strong> {formatTime(((quiz.timeLimit || 20) * 60) - timeRemaining)}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Submitted At:</strong> {new Date().toLocaleString()}</p>
                  <p><strong>Total Points:</strong> {quiz.totalPoints || 0}</p>
                  <p><strong>Completion:</strong> {Math.round((answeredQuestions / totalQuestions) * 100)}%</p>
                </Col>
              </Row>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
              >
                Back to Quizzes
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }
  if (!quizStarted) {
    return (
      <Container className="py-4">
        <Card>
          <Card.Header>
            <h2>{quiz.title}</h2>
            {!quiz.published && (
              <Alert variant="warning" className="mt-2 mb-0">
                <small>This quiz is not yet published</small>
              </Alert>
            )}
          </Card.Header>
          <Card.Body>
            <p><strong>Instructions:</strong></p>
            <p>{quiz.description || 'No instructions provided'}</p>
              <Row className="mt-4">
              <Col md={6}>
                <p><strong>Time Limit:</strong> {quiz.timeLimit || 20} minutes</p>
                <p><strong>Questions:</strong> {questions.length}</p>
                <p><strong>Total Points:</strong> {quiz.totalPoints || 0}</p>
              </Col>
              <Col md={6}>
                <p><strong>Attempts Allowed:</strong> {quiz.multipleAttempts ? (quiz.attemptsAllowed || 1) : 1}</p>
                <p><strong>Due Date:</strong> {quiz.dueDate ? new Date(quiz.dueDate).toLocaleString() : 'No due date'}</p>
              </Col>
            </Row>

            <Alert variant="warning" className="mt-3">
              <strong>Important:</strong> Once you start the quiz, the timer will begin. Make sure you have a stable internet connection.
            </Alert>

            <div className="d-flex gap-2 mt-4">
              <Button 
                variant="secondary" 
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
              >
                Cancel
              </Button>
              <Button 
                variant="success" 
                onClick={handleStartQuiz}
                size="lg"
                disabled={!quiz.published && currentUser?.role === "STUDENT"}
              >
                {!quiz.published && currentUser?.role === "STUDENT" ? 'Quiz Not Available' : 'Start Quiz'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }  return (
    <Container className="py-4 quiz-taking-container">
      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col>
              <h4>{quiz.title}</h4>
            </Col>
            <Col className="text-end">
              <h5 className={`quiz-timer ${timeRemaining < 300 ? 'warning' : ''}`}>
                Time Remaining: {formatTime(timeRemaining)}
              </h5>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {currentQuestion && (
        <Card className="question-card">
          <Card.Header>
            <Row>
              <Col>
                <h5>Question {currentQuestionIndex + 1} of {questions.length}</h5>
              </Col>
              <Col className="text-end">
                <small className="text-muted">
                  Points: {currentQuestion.points || 1}
                </small>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <h6>{currentQuestion.title}</h6>
            {currentQuestion.body && <p>{currentQuestion.body}</p>}
            
            <div className="mt-3">
              {currentQuestion.type === 'multiple-choice' && (
                <Form>
                  {currentQuestion.choices?.map((choice: any, index: number) => (
                    <Form.Check
                      key={index}
                      type="radio"
                      name={`question-${currentQuestion._id}`}
                      id={`choice-${index}`}
                      label={choice.text}
                      checked={answers[currentQuestion._id] === choice.text}
                      onChange={() => handleAnswerChange(currentQuestion._id, choice.text)}
                      className="mb-2"
                    />
                  ))}
                </Form>
              )}

              {currentQuestion.type === 'true-false' && (
                <Form>
                  <Form.Check
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    id="true"
                    label="True"
                    checked={answers[currentQuestion._id] === true}
                    onChange={() => handleAnswerChange(currentQuestion._id, true)}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    id="false"
                    label="False"
                    checked={answers[currentQuestion._id] === false}
                    onChange={() => handleAnswerChange(currentQuestion._id, false)}
                    className="mb-2"
                  />
                </Form>
              )}

              {currentQuestion.type === 'fill-in-blank' && (
                <Form.Control
                  type="text"
                  placeholder="Enter your answer..."
                  value={answers[currentQuestion._id] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                />
              )}

              <div className="mt-3">
                <span className={`answer-status ${answers[currentQuestion._id] !== undefined ? 'answered' : 'unanswered'}`}>
                  {answers[currentQuestion._id] !== undefined ? '✓ Answered' : '⚠ Not answered'}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="outline-secondary"
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
        >
          Previous
        </Button>
        
        <div className="d-flex gap-2">
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={handleSubmitQuiz}
              disabled={Object.keys(answers).length === 0}
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </div>
      <Card className="mt-4">
        <Card.Header>
          <h6>Question Navigator</h6>
        </Card.Header>
        <Card.Body className="question-navigator">
          <div className="d-flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={
                  index === currentQuestionIndex 
                    ? "primary" 
                    : answers[questions[index]._id] !== undefined 
                      ? "success" 
                      : "outline-secondary"
                }
                size="sm"
                onClick={() => setCurrentQuestionIndex(index)}
                className="question-nav-button d-flex align-items-center justify-content-center"
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
