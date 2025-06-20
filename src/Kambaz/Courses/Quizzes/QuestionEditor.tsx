import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Form } from "react-bootstrap";
import * as quizzesClient from "./client";
import { v4 as uuidv4 } from 'uuid';

interface Choice {
    _id: string;
    text: string;
    isCorrect: boolean;
}

export default function QuestionEditor() {
    const { cid, qid, questionId } = useParams<{ cid: string; qid: string; questionId?: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const isNew = location.pathname.includes('/question-new');
    
    console.log("QuestionEditor - URL params:", { cid, qid, questionId, isNew, pathname: location.pathname });
    const [currentQuestionId, setCurrentQuestionId] = useState<string | undefined>(undefined);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [type, setType] = useState<'multiple_choice' | 'true_false' | 'fill_in_blank'>('multiple_choice');
    const [points, setPoints] = useState(1);
    const [choices, setChoices] = useState<Choice[]>([
        { _id: uuidv4(), text: "", isCorrect: false },
        { _id: uuidv4(), text: "", isCorrect: false }
    ]);
    const [trueOrFalse, setTrueOrFalse] = useState(true);
    const [acceptableAnswers, setAcceptableAnswers] = useState<string[]>([""]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!isNew && questionId) {
            const fetchQuestion = async () => {
                try {
                    const question = await quizzesClient.getQuestion(questionId);
                    setCurrentQuestionId(question._id);
                    setTitle(question.title || "");
                    setBody(question.body || "");
                    setType((question.type as 'multiple_choice' | 'true_false' | 'fill_in_blank') || 'multiple_choice');
                    setPoints(question.points || 1);
                      if (question.type === 'multiple_choice' && question.choices) {
                        const processedChoices = question.choices.map((choice: any) => ({
                            _id: choice._id || uuidv4(),
                            text: choice.text || "",
                            isCorrect: choice.isCorrect || false
                        }));
                        setChoices(processedChoices.length > 0 ? processedChoices : [
                            { _id: uuidv4(), text: "", isCorrect: false },
                            { _id: uuidv4(), text: "", isCorrect: false }
                        ]);
                    }
                    
                    if (question.type === 'true_false') {
                        setTrueOrFalse(question.trueOrFalse ?? true);
                    }
                    
                    if (question.type === 'fill_in_blank' && question.acceptableAnswers) {
                        setAcceptableAnswers(question.acceptableAnswers.length > 0 ? question.acceptableAnswers : [""]);
                    }
                } catch (error) {
                    console.error("Error fetching question:", error);
                }
            };
            fetchQuestion();
        }
    }, [isNew, questionId]);

    const addChoice = () => {
        setChoices([...choices, { _id: uuidv4(), text: "", isCorrect: false }]);
    };

    const removeChoice = (choiceId: string) => {
        if (choices.length > 2) {
            setChoices(choices.filter(choice => choice._id !== choiceId));
        }
    };

    const updateChoice = (choiceId: string, text: string) => {
        setChoices(choices.map(choice => 
            choice._id === choiceId ? { ...choice, text } : choice
        ));
    };

    const setCorrectChoice = (choiceId: string) => {
        setChoices(choices.map(choice => 
            ({ ...choice, isCorrect: choice._id === choiceId })
        ));
    };

    const addAcceptableAnswer = () => {
        setAcceptableAnswers([...acceptableAnswers, ""]);
    };

    const removeAcceptableAnswer = (index: number) => {
        if (acceptableAnswers.length > 1) {
            setAcceptableAnswers(acceptableAnswers.filter((_, i) => i !== index));
        }
    };

    const updateAcceptableAnswer = (index: number, value: string) => {
        const newAnswers = [...acceptableAnswers];
        newAnswers[index] = value;
        setAcceptableAnswers(newAnswers);
    };

    useEffect(() => {
        if (type === 'multiple_choice') {
            setChoices([
                { _id: uuidv4(), text: "", isCorrect: false },
                { _id: uuidv4(), text: "", isCorrect: false }
            ]);
        } else if (type === 'fill_in_blank') {
            setAcceptableAnswers([""]);
        }
    }, [type]);

    const handleSave = async () => {
        if (!title.trim()) {
            alert("Please enter a question title");
            return;
        }

        if (!isNew && !currentQuestionId) {
            alert("Error: Question ID not found. Please refresh and try again.");
            return;
        }

        if (type === 'multiple_choice') {
            const hasCorrectAnswer = choices.some(choice => choice.isCorrect);
            const hasValidChoices = choices.every(choice => choice.text.trim());
            
            if (!hasValidChoices) {
                alert("Please fill in all choice options");
                return;
            }
            if (!hasCorrectAnswer) {
                alert("Please select the correct answer");
                return;
            }
        }

        if (type === 'fill_in_blank') {
            const hasValidAnswers = acceptableAnswers.some(answer => answer.trim());
            if (!hasValidAnswers) {
                alert("Please provide at least one acceptable answer");
                return;
            }
        }        const questionData: any = {
            _id: isNew ? uuidv4() : currentQuestionId!,
            title,
            body,
            type,
            points,
            quizId: qid!
        };

        if (type === 'multiple_choice') {
            (questionData as any).choices = choices.filter(choice => choice.text.trim());
        } else if (type === 'true_false') {
            (questionData as any).trueOrFalse = trueOrFalse;
        } else if (type === 'fill_in_blank') {
            (questionData as any).acceptableAnswers = acceptableAnswers.filter(answer => answer.trim());
        }

        try {
            setLoading(true);
            if (isNew) {
                await quizzesClient.addQuestion(qid!, questionData);
            } else {
                await quizzesClient.updateQuestion(questionData);
            }
            navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/questions`);
        } catch (error) {
            console.error("Error saving question:", error);
            alert("Error saving question. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate(`/Kambaz/Courses/${cid}/Quizzes/${qid}/questions`);
    };    return (
        <div className="p-4">
            <h3 className="mb-4">
                {isNew ? 'Create New Question' : 'Edit Question'}
            </h3>
            <Form>
                <div className="row mb-3">
                    <div className="col-8">
                        <label className="form-label">Question Title *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter your question"
                        />
                    </div>
                    <div className="col-4">
                        <label className="form-label">Points</label>
                        <input
                            type="number"
                            className="form-control"
                            min="0"
                            value={points}
                            onChange={(e) => setPoints(parseInt(e.target.value) || 1)}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Question Type</label>
                    <select
                        className="form-select"
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                    >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="fill_in_blank">Fill in the Blank</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="form-label">Question Description (Optional)</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Additional context or instructions for the question"
                    />
                </div>
                {type === 'multiple_choice' && (
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Answer Choices</h5>
                            <button 
                                type="button" 
                                className="btn btn-sm btn-outline-primary" 
                                onClick={addChoice}
                            >
                                + Add Choice
                            </button>
                        </div>
                        
                        {choices.map((choice, index) => (
                            <div key={choice._id} className="mb-3">
                                <div className="d-flex align-items-center">
                                    <input
                                        type="radio"
                                        name="correctAnswer"
                                        checked={choice.isCorrect}
                                        onChange={() => setCorrectChoice(choice._id)}
                                        className="me-2"
                                    />
                                    <input
                                        type="text"
                                        className="form-control me-2"
                                        value={choice.text}
                                        onChange={(e) => updateChoice(choice._id, e.target.value)}
                                        placeholder={`Choice ${index + 1}`}
                                    />
                                    {choices.length > 2 && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeChoice(choice._id)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <small className="text-muted">
                            Select the radio button next to the correct answer
                        </small>
                    </div>
                )}                {type === 'true_false' && (
                    <div className="mb-4">
                        <h5 className="mb-3">Correct Answer</h5>
                        <div className="form-check mb-2">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="truefalse"
                                checked={trueOrFalse === true}
                                onChange={() => setTrueOrFalse(true)}
                            />
                            <label className="form-check-label">True</label>
                        </div>
                        <div className="form-check">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="truefalse"
                                checked={trueOrFalse === false}
                                onChange={() => setTrueOrFalse(false)}
                            />
                            <label className="form-check-label">False</label>
                        </div>
                    </div>
                )}

                {type === 'fill_in_blank' && (
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5>Acceptable Answers</h5>
                            <button 
                                type="button" 
                                className="btn btn-sm btn-outline-primary" 
                                onClick={addAcceptableAnswer}
                            >
                                + Add Answer
                            </button>
                        </div>
                        
                        {acceptableAnswers.map((answer, index) => (
                            <div key={index} className="mb-3">
                                <div className="d-flex align-items-center">
                                    <input
                                        type="text"
                                        className="form-control me-2"
                                        value={answer}
                                        onChange={(e) => updateAcceptableAnswer(index, e.target.value)}
                                        placeholder={`Acceptable answer ${index + 1}`}
                                    />
                                    {acceptableAnswers.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeAcceptableAnswer(index)}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <small className="text-muted">
                            Students' answers will be marked correct if they match any of these answers (case-insensitive)
                        </small>
                    </div>
                )}

                <div className="d-flex gap-2">
                    <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Question'}
                    </button>
                </div>
            </Form>
        </div>
    );
}
