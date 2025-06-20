import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { Modal } from "react-bootstrap";
import { MdDragIndicator } from "react-icons/md";
import { Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as quizzesClient from "./client";

function SortableQuestionItem({ question, index, onEdit, onDelete }: {
  question: any;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice';
      case 'true_false':
        return 'True/False';
      case 'fill_in_blank':
        return 'Fill in the Blank';
      default:
        return 'Unknown';
    }
  };
  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="d-flex align-items-center p-3 border-bottom"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="me-2 fs-4 text-muted" 
        style={{ cursor: 'grab' }}
>
        <MdDragIndicator />
      </div>
      
      <div className="flex-grow-1">
        <div className="d-flex align-items-center mb-2">
          <strong className="me-2">Question {index + 1}</strong>
          <span className="badge bg-secondary me-2">
            {getQuestionTypeLabel(question.type)}
          </span>
          <span className="badge bg-info">
            {question.points || 1} pt{(question.points || 1) !== 1 ? 's' : ''}
          </span>
        </div>
        <h6 className="mb-1">{question.title}</h6>
        {question.body && (
          <p className="mb-0 text-muted small">
            {question.body.length > 100 
              ? `${question.body.substring(0, 100)}...` 
              : question.body}
          </p>
        )}
      </div>

      <div className="d-flex gap-2">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => onEdit(question._id)}
        >
          Edit
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(question._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function Questions() {
    const { cid, qid } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<any[]>([]);
    const [toDelete, setToDelete] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const quiz = useSelector((state: any) => 
        state.quizzesReducer.list.find((q: any) => q._id === qid)
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const questionsData = await quizzesClient.fetchQuestions(qid as string);
            const sortedQuestions = questionsData.sort((a: any, b: any) => {
                const posA = a.position ?? questionsData.indexOf(a);
                const posB = b.position ?? questionsData.indexOf(b);
                return posA - posB;
            });
            setQuestions(sortedQuestions);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (qid) {
            fetchQuestions();
        }
    }, [qid]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = questions.findIndex(q => q._id === active.id);
            const newIndex = questions.findIndex(q => q._id === over?.id);
            const newQuestions = arrayMove(questions, oldIndex, newIndex);
            setQuestions(newQuestions);
            try {
                const questionIds = newQuestions.map(q => q._id);
                await quizzesClient.reorderQuestions(qid as string, questionIds);
            } catch (error) {
                console.error("Error reordering questions:", error);
                setQuestions(questions);
            }
        }
    };
    const handleDeleteQuestion = async (questionId: string) => {
        try {
            await quizzesClient.deleteQuestion(questionId);
            await fetchQuestions();
            setToDelete(null);
        } catch (error) {
            console.error("Error deleting question:", error);
            setToDelete(null);
        }
    };    
    const handleEditQuestion = (questionId: string) => {
      navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/question-edit/${questionId}`);
    };
    if (loading) {
        return (
            <div className="p-4">
                <h3>Loading questions...</h3>
            </div>
        );
    }
    return (        
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3>Questions for: {quiz?.title || 'Quiz'}</h3>
            <p className="text-muted">
              <Link to={`/Kambaz/Courses/${cid}/Quizzes/${qid}`}>
                ← Back to Quiz Details
              </Link>
            </p>
          </div>
          <button 
            className="btn btn-danger"
            onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/question-new`)}
          >
            + New Question
          </button>
          </div>
            <div className="border rounded">
              <div className="bg-light p-3 border-bottom">
                <h5 className="mb-0">Questions ({questions.length})</h5>
              </div>
              {questions.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted">No questions added yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/question-new`)}
                  >
                    Add First Question
                  </button>
                </div>
              ) : (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                <SortableContext 
                  items={questions.map(q => q._id)}
                  strategy={verticalListSortingStrategy}
                >
                <div>
                  {questions.map((question, index) => (
                    <SortableQuestionItem
                      key={question._id}
                      question={question}
                      index={index}
                      onEdit={handleEditQuestion}
                      onDelete={(id) => setToDelete(id)}
                    />
                  ))}
                </div>
                </SortableContext>
                </DndContext>
              )}
            </div>
            <Modal show={!!toDelete} onHide={() => setToDelete(null)}>
              <Modal.Header closeButton>
                <Modal.Title>Delete Question?</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure you want to delete this question? This action cannot be undone.
              </Modal.Body>
              <Modal.Footer>
                <button className="btn btn-secondary me-2" onClick={() => setToDelete(null)}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteQuestion(toDelete!)}
                >
                  Yes, Delete
                </button>
              </Modal.Footer>
            </Modal>
      </div>
    );
}
