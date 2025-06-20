import { Container, Button, Card, Row, Col, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import * as quizzesClient from './client';
import { addQuiz, setCurrentQuiz } from './reducer';

export default function QuizDetails() {
  const { cid, qid } = useParams<{ cid: string; qid: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [questionCount, setQuestionCount] = useState<number>(0);
  const { currentUser } = useSelector((state: any) => state.accountReducer);
  const quiz = useSelector((state: any) => 
    state.quizzesReducer.list.find((q: any) => q._id === qid)
  );
  
  const isFaculty = currentUser?.role === "FACULTY";
  useEffect(() => {
    if (!quiz && qid) {
      const fetchQuiz = async () => {
        try {
          const quizData = await quizzesClient.fetchQuiz(qid);
          dispatch(addQuiz(quizData));
          dispatch(setCurrentQuiz(quizData));
        } catch (error) {
          console.error('Error fetching quiz:', error);
        }
      };
      fetchQuiz();
    }
  }, [qid, quiz, dispatch]);

  useEffect(() => {
    if (qid) {
      const fetchQuestionCount = async () => {
        try {
          const questions = await quizzesClient.fetchQuestions(qid);
          setQuestionCount(questions.length);
        } catch (error) {
          console.error('Error fetching questions:', error);
          setQuestionCount(0);
        }
      };
      fetchQuestionCount();
    }
  }, [qid]);

  if (!quiz) {
    return (
      <Container className="py-4">
        <div>Loading quiz...</div>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container className="py-4" id="wd-quiz-details">      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{quiz.title}</h2>
        {isFaculty ? (
          <Button 
            variant="primary" 
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/edit`)}
          >
            Edit
          </Button>
        ) : (
          <Button 
            variant="success" 
            size="lg"
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/take`)}
          >
            Take Quiz
          </Button>
        )}
      </div>
      <div className="mb-3">
        <Badge bg={quiz.published ? 'success' : 'secondary'}>
          {quiz.published ? 'Published' : 'Not Published'}
        </Badge>
      </div>
      <Card>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5>Quiz Information</h5>
              <p><strong>Description:</strong></p>
              <p>{quiz.description || 'No description provided'}</p>
              
              <p><strong>Quiz Type:</strong> {quiz.type || 'Graded Quiz'}</p>
              <p><strong>Assignment Group:</strong> {quiz.assignmentGroup || 'Quizzes'}</p>
              <p><strong>Total Points:</strong> {quiz.totalPoints || 0}</p>
              <p><strong>Time Limit:</strong> {quiz.timeLimit || 'No limit'} minutes</p>
            </Col>
            
            <Col md={6}>
              <h5>Availability</h5>
              <p><strong>Available Date:</strong></p>
              <p>{formatDate(quiz.availableDate)}</p>
              
              <p><strong>Due Date:</strong></p>
              <p>{formatDate(quiz.dueDate)}</p>
              
              <p><strong>Published:</strong> {quiz.published ? 'Yes' : 'No'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card className="mt-3">
        <Card.Body>
          <h5>Quiz Settings</h5>
          <Row>
            <Col md={6}>
              <p><strong>Shuffle Answers:</strong> {quiz.shuffleAnswers !== false ? 'Yes' : 'No'}</p>
              <p><strong>Multiple Attempts:</strong> {quiz.multipleAttempts ? 'Yes' : 'No'}</p>
              {quiz.multipleAttempts && (
                <p><strong>Attempts Allowed:</strong> {quiz.attemptsAllowed || 1}</p>
              )}
            </Col>
            <Col md={6}>
              <p><strong>Show Correct Answers:</strong> {quiz.showCorrectAnswers ? 'Yes' : 'No'}</p>
              <p><strong>One Question at a Time:</strong> {quiz.oneQuestionAtATime !== false ? 'Yes' : 'No'}</p>
              <p><strong>Webcam Required:</strong> {quiz.webcamRequired ? 'Yes' : 'No'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      <Card className="mt-3">
        <Card.Body>          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Questions</h5>
            {isFaculty && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/questions`)}
              >
                Manage Questions
              </Button>
            )}
          </div><p className="text-muted">
            This quiz has {questionCount} questions.
          </p>
        </Card.Body>
      </Card>      <div className="mt-4 d-flex gap-2">
        <Button 
          variant="secondary" 
          onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes`)}
        >
          Back to Quizzes
        </Button>
        {isFaculty && (
          <Button 
            variant={quiz.published ? 'warning' : 'success'}
            onClick={async () => {
              try {
                if (quiz.published) {
                  await quizzesClient.unpublishQuiz(qid!);
                } else {
                  await quizzesClient.publishQuiz(qid!);
                }
                window.location.reload();
              } catch (error) {
                console.error('Error toggling publish status:', error);
              }
            }}
          >
            {quiz.published ? 'Unpublish' : 'Publish'}
          </Button>
        )}
      </div>
    </Container>
  );
}
