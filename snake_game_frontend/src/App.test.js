import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders snake score in UI", () => {
  render(<App />);
  const scoreElement = screen.getByText(/score/i);
  expect(scoreElement).toBeInTheDocument();
});

test("renders start button before game starts", () => {
  render(<App />);
  const startBtn = screen.getByTestId("start-btn");
  expect(startBtn).toBeInTheDocument();
});

test("renders pause and restart button during game", () => {
  render(<App />);
  const startBtn = screen.getByTestId("start-btn");
  startBtn.click();
  const pauseBtn = screen.getByTestId("pause-btn");
  expect(pauseBtn).toBeInTheDocument();
});
