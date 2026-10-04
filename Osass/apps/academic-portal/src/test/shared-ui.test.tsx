import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HtmlContent } from "@osass/ui/html-content";
import { ScoreInputPanel } from "@osass/ui/score-input-panel";
import { FilePreviewModal } from "@osass/ui/file-preview-modal";
import { GoogleSignInButton } from "@osass/ui/google-sign-in-button";

afterEach(() => {
  cleanup();
  delete window.google;
});

describe("shared portal UI", () => {
  it("preserves prose styling and sanitizes rich HTML", () => {
    const { container, rerender } = render(
      <HtmlContent className="review-remarks" html={'<p><strong>Evidence</strong></p><img src="x" onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">link</a>'} />,
    );
    expect(container.firstElementChild).toHaveClass("prose", "prose-sm", "dark:prose-invert", "max-w-none", "review-remarks");
    expect(container.querySelector("strong")).toHaveTextContent("Evidence");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).not.toHaveAttribute("onerror");
    expect(container.querySelector("a")).not.toHaveAttribute("href");
    rerender(<HtmlContent html="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(["DAPC", "FAPSC", "HOU", "AAPSC", "UAPC"])("keeps score and remarks inputs controlled and focused for %s", (committeeType) => {
    function Assessment() {
      const [score, setScore] = useState<number>();
      const [remarks, setRemarks] = useState("");
      return <ScoreInputPanel currentScore={score} maxScore={10} onScoreChange={setScore} remarks={remarks} onRemarksChange={setRemarks} committeeType={committeeType} />;
    }
    render(<Assessment />);
    expect(screen.getByText(`Your Assessment (${committeeType})`)).toBeInTheDocument();
    const score = screen.getByRole("spinbutton", { name: "Score (max: 10)" });
    const remarks = screen.getByRole("textbox", { name: "Remarks" });
    score.focus();
    fireEvent.change(score, { target: { value: "7.5" } });
    expect(score).toHaveValue(7.5);
    expect(score).toHaveFocus();
    fireEvent.change(score, { target: { value: "12" } });
    expect(score).toHaveValue(10);
    fireEvent.change(score, { target: { value: "" } });
    expect(score).toHaveValue(0);
    remarks.focus();
    fireEvent.change(remarks, { target: { value: "Checked the evidence" } });
    expect(remarks).toHaveValue("Checked the evidence");
    expect(remarks).toHaveFocus();
    expect(score).toHaveAttribute("step", "0.5");
    expect(score).toHaveAttribute("min", "0");
    expect(score).toHaveAttribute("max", "10");
  });

  it("gives independent score panels distinct accessible labels", () => {
    const onChange = vi.fn();
    render(<><ScoreInputPanel onScoreChange={onChange} onRemarksChange={onChange} /><ScoreInputPanel onScoreChange={onChange} onRemarksChange={onChange} /></>);
    const scores = screen.getAllByRole("spinbutton", { name: "Score" });
    const remarks = screen.getAllByRole("textbox", { name: "Remarks" });
    expect(new Set([...scores, ...remarks].map(input => input.id)).size).toBe(4);
  });

  it("uses the supplied Google client ID and forwards credentials", () => {
    const initialize = vi.fn();
    const renderButton = vi.fn();
    window.google = { accounts: { id: { initialize, renderButton } } };
    const onCredential = vi.fn();
    const { container, rerender } = render(<GoogleSignInButton onCredential={onCredential} />);
    expect(container).toBeEmptyDOMElement();
    expect(initialize).not.toHaveBeenCalled();
    rerender(<GoogleSignInButton clientId="portal-client" onCredential={onCredential} />);
    expect(initialize.mock.calls[0][0].client_id).toBe("portal-client");
    initialize.mock.calls[0][0].callback({ credential: "id-token" });
    expect(onCredential).toHaveBeenCalledWith("id-token");
    expect(renderButton).toHaveBeenCalledWith(container.firstElementChild, { theme: "outline", size: "large", width: "100%" });
  });

  it("previews signed PDFs and provides the existing download fallback for attachments", () => {
    const { rerender } = render(<FilePreviewModal isOpen onClose={vi.fn()} fileUrl="https://storage.example/My%20Paper.pdf?signature=signed" fileName="My Paper.pdf" />);
    expect(document.querySelector("iframe")).not.toBeNull();
    rerender(<FilePreviewModal isOpen onClose={vi.fn()} fileUrl="https://storage.example/My%20Paper.pdf?response-content-disposition=attachment" fileName="My Paper.pdf" />);
    expect(document.querySelector("iframe")).toBeNull();
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();
  });
});
