import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ApplicationView from "@/pages/ApplicationView";
import { academicService } from "@/services/academicService";

vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { position: "Lecturer" }, eligibility: { activeApplication: { applicationStatus: "Under Review" } } }) }));

describe("submitted application view", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renders the submitted snapshot and current service response shape", async () => {
    vi.spyOn(academicService, "getSubmittedPreview").mockResolvedValue({
      success: true, code: 200, message: "", data: {
        teachingApplication: { teachingApplicationData: [{ category: "Lecture Load", remark: "Prepared", score: 80 }] },
        publicationApplication: { publicationApplicationData: [{ title: "Research paper", year: 2026, systemScore: 10, score: 8 }] },
        serviceApplication: { serviceApplicationData: [{ title: "Committee Chair", categoryName: "University", score: 30 }, { title: "External Adviser", categoryName: "National", score: 20 }] },
      },
    });
    render(<MemoryRouter><ApplicationView /></MemoryRouter>);
    expect(await screen.findByText("Research paper")).toBeInTheDocument();
    expect(screen.getByText("Committee Chair")).toBeInTheDocument();
    expect(screen.getByText("External Adviser")).toBeInTheDocument();
    expect(screen.getByText("Lecture Load")).toBeInTheDocument();
  });

  it("shows an error instead of silently rendering an empty application", async () => {
    vi.spyOn(academicService, "getSubmittedPreview").mockResolvedValue({ success: false, code: 400, message: "Unavailable", data: null });
    render(<MemoryRouter><ApplicationView /></MemoryRouter>);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load");
  });
});
