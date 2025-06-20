import { IoEllipsisVertical } from "react-icons/io5";
import { BsPlus } from "react-icons/bs";
import GreenCheckmark from "../Assignments/GreenCheckmark";

interface QuizControlButtonsProps {
  published?: boolean;
}

export default function QuizControlButtons({ published = false }: QuizControlButtonsProps) {
  return (
    <div className="d-flex align-items-center ms-auto">
      <BsPlus className="fs-4 me-2" />
      {published && <GreenCheckmark />}
      <IoEllipsisVertical className="fs-4" />
    </div>
  );
}
