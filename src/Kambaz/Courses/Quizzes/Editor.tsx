import { Form, Button, Container } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { addQuiz, updateQuiz, setCurrentQuiz } from "./reducer";
import * as quizzesClient from "./client";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

export default function QuizEditor() {
  const { cid, qid } = useParams<{ cid: string; qid: string }>();
  const location = useLocation();

  const isNew = qid === "new" || qid === "Create" || qid === undefined || location.pathname.includes('/Create');
  const isEdit = location.pathname.includes('/edit');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log("QuizEditor - pathname:", location.pathname, "cid:", cid, "qid:", qid, "isNew:", isNew, "isEdit:", isEdit);
  const existing = useSelector((s: any) =>
    s.quizzesReducer.list.find((q: any) => q._id === qid)
  );

  useEffect(() => {
    if (isEdit && !existing && qid) {
      const fetchQuiz = async () => {
        try {
          const quizData = await quizzesClient.fetchQuiz(qid);
          dispatch(addQuiz(quizData));
          dispatch(setCurrentQuiz(quizData));
        } catch (error) {
          console.error('Error fetching quiz for editing:', error);
        }
      };
      fetchQuiz();
    }
  }, [isEdit, existing, qid, dispatch]);
  const [title, setTitle] = useState(existing?.title || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [published, setPublished] = useState(existing?.published || false);
  const [availableDate, setAvailableDate] = useState(existing?.availableDate || "");
  const [dueDate, setDueDate] = useState(existing?.dueDate || "");
  const [timeLimit, setTimeLimit] = useState(existing?.timeLimit || 20);
  const [totalPoints, setTotalPoints] = useState(existing?.totalPoints || 0);
  const [shuffleAnswers, setShuffleAnswers] = useState(existing?.shuffleAnswers !== false);
  useEffect(() => {
    if (existing) {
      setTitle(existing.title || "");
      setDescription(existing.description || "");
      setPublished(existing.published || false);
      setAvailableDate(existing.availableDate || "");
      setDueDate(existing.dueDate || "");
      setTimeLimit(existing.timeLimit || 20);
      setTotalPoints(existing.totalPoints || 0);
      setShuffleAnswers(existing.shuffleAnswers !== false);
    }
  }, [existing]);
  async function onSave() {
    console.log("onSave called - qid:", qid, "isNew:", isNew);    const payload = {
      _id: isNew ? uuidv4() : qid,
      title,
      description,
      published,
      shuffleAnswers,
      availableDate: availableDate ? new Date(availableDate).toISOString() : undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      timeLimit,
      totalPoints,
      courseId: cid!,
      type: 'Graded Quiz',
    };
    
    try {
      if (isNew) {
        console.log("Creating new quiz with payload:", payload);
        const newQuiz = await quizzesClient.createQuizForCourse(cid!, payload);
        dispatch(addQuiz(newQuiz));
      } else {
        console.log("Updating existing quiz with qid:", qid);
        const { _id, ...updatePayload } = payload;
        const updatedQuiz = await quizzesClient.updateQuiz({ _id: qid!, ...updatePayload });
        dispatch(updateQuiz(updatedQuiz));
      }

      if (isNew) {
        navigate(`/Kambaz/Courses/${cid}/Quizzes`);
      } else {
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`);
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  }
  function onCancel() {
    if (isEdit && qid) {
      navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}`);
    } else {
      navigate(`/Kambaz/Courses/${cid}/Quizzes`);
    }
  }
  return (
    <Container className="py-4" id="wd-quiz-editor">
      <h2 className="mb-4">
        {isNew ? 'Create New Quiz' : 'Edit Quiz'}
      </h2>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label htmlFor="wd-quiz-title">Quiz Title</Form.Label>
          <Form.Control
            id="wd-quiz-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="wd-quiz-description">Quiz Instructions</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            id="wd-quiz-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quiz instructions"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="wd-quiz-points">Points</Form.Label>
          <Form.Control
            id="wd-quiz-points"
            type="number"
            value={totalPoints}
            onChange={(e) => setTotalPoints(Number(e.target.value))}
            placeholder="Enter total points"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="wd-quiz-time-limit">Time Limit (minutes)</Form.Label>
          <Form.Control
            id="wd-quiz-time-limit"
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            placeholder="Enter time limit in minutes"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="wd-quiz-available-date">Available Date</Form.Label>
          <Form.Control
            id="wd-quiz-available-date"
            type="datetime-local"
            value={availableDate}
            onChange={(e) => setAvailableDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="wd-quiz-due-date">Due Date</Form.Label>
          <Form.Control
            id="wd-quiz-due-date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Form.Group>        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            id="wd-quiz-shuffle-answers"
            label="Shuffle Answers"
            checked={shuffleAnswers}
            onChange={(e) => setShuffleAnswers(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            id="wd-quiz-published"
            label="Published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
        </Form.Group>

        <div className="d-flex gap-2">
          <Button 
            variant="secondary" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={onSave}
          >
            Save
          </Button>
        </div>
      </Form>
    </Container>
  );
}
