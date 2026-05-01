import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Printer, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { academicService } from "@/services/academicService";
import { PromotionLetterData } from "@/types/promotionLetter";
import { toast } from "sonner";

const PromotionLetter = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applicationId } = useParams<{ applicationId?: string }>();
  const [letterData, setLetterData] = useState<PromotionLetterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const printFrameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const fetchLetter = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch from API with optional applicationId
        const res = await academicService.getPromotionLetter(applicationId);
        if (res.success && res.data) {
          setLetterData(res.data);
        } else {
          setError(res.message || "No promotion letter available");
        }
      } catch (err) {
        console.error("Failed to fetch promotion letter:", err);
        setError("Failed to load promotion letter. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLetter();
  }, [applicationId]);

  const handlePrint = useCallback(() => {
    if (!letterRef.current) {
      toast.error("Letter content not found");
      return;
    }

    // Create a hidden iframe for printing only the letter content
    const printContent = letterRef.current.innerHTML;
    
    // Remove existing print frame if any
    if (printFrameRef.current) {
      document.body.removeChild(printFrameRef.current);
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    printFrameRef.current = iframe;
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      toast.error("Failed to initialize print");
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Promotion Letter - ${letterData?.staffName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12pt;
              line-height: 1.6;
              color: #000;
              background: #fff;
              padding: 0.5in;
            }
            .letter-header {
              text-align: center;
              border-bottom: 2px solid #1a365d;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .university-name {
              font-size: 16pt;
              font-weight: bold;
              color: #1a365d;
              letter-spacing: 2px;
            }
            .university-location {
              font-size: 10pt;
              color: #666;
              margin-top: 4px;
            }
            .letter-logo {
              width: 60px;
              height: 60px;
              border: 2px solid #1a365d;
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin: 15px 0;
              font-weight: bold;
              font-size: 14pt;
              color: #1a365d;
            }
            .letter-meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              font-size: 11pt;
            }
            .meta-label {
              color: #666;
            }
            .meta-value {
              font-weight: 600;
            }
            .recipient {
              margin-bottom: 30px;
              font-size: 11pt;
            }
            .recipient-line {
              margin-bottom: 4px;
            }
            .recipient-name {
              font-weight: 600;
            }
            .salutation {
              margin-bottom: 20px;
              font-weight: 600;
            }
            .subject {
              font-weight: 600;
              margin-bottom: 15px;
            }
            .body-text {
              text-align: justify;
              margin-bottom: 15px;
            }
            .performance-box {
              background: #f7fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .performance-title {
              font-weight: 600;
              margin-bottom: 15px;
              font-size: 11pt;
            }
            .performance-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .performance-item {
              text-align: center;
            }
            .performance-label {
              color: #666;
              font-size: 10pt;
            }
            .performance-value {
              font-weight: 600;
              font-size: 14pt;
              color: #1a365d;
            }
            .closing {
              margin-top: 40px;
            }
            .signature-block {
              margin-top: 60px;
            }
            .signatory-name {
              font-weight: 600;
            }
            .signatory-title {
              color: #666;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 9pt;
              color: #666;
              text-align: center;
            }
            @media print {
              body {
                padding: 0;
              }
              @page {
                margin: 0.75in;
                size: A4;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    doc.close();

    // Wait for content to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 250);
    };
  }, [letterData]);

  const handleDownload = useCallback(() => {
    // Use the same print approach but inform user to save as PDF
    handlePrint();
    toast.info("Use 'Save as PDF' in the print dialog to download");
  }, [handlePrint]);

  // Cleanup print frame on unmount
  useEffect(() => {
    return () => {
      if (printFrameRef.current && printFrameRef.current.parentNode) {
        printFrameRef.current.parentNode.removeChild(printFrameRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="space-y-4">
            <div className="h-96 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !letterData) {
    return (
      <div className="page-container">
        <div className="content-container">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="card-elevated p-8 border border-warning/30 bg-warning/5">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">No Promotion Letter Available</h3>
                <p className="text-sm text-muted-foreground">
                  {error || "Your application must be approved before a promotion letter is generated. Check back after your application receives final approval."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        {/* Header - Hidden during print */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Letter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Save as PDF
            </Button>
          </div>
        </div>

        {/* Letter Content - This is what gets printed/downloaded */}
        <div
          ref={letterRef}
          className="max-w-4xl mx-auto bg-white text-black p-12 shadow-lg rounded-lg"
        >
          {/* UMaT Header */}
          <div className="letter-header text-center border-b-2 border-primary pb-6 mb-8">
            <div className="university-name text-sm font-bold text-primary tracking-wide mb-2">UNIVERSITY OF MINES AND TECHNOLOGY</div>
            <div className="university-location text-xs text-muted-foreground mb-4">TARKWA, GHANA</div>
            <div className="flex justify-center items-center gap-2 mb-3">
              <img 
                src="/umatLogo.png" 
                alt="UMaT Logo" 
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>

          {/* Letter Number and Date */}
          <div className="letter-meta flex justify-between mb-8 text-sm">
            <div>
              <span className="meta-label text-muted-foreground">Letter No.: </span>
              <span className="meta-value font-semibold">{letterData.letterNumber}</span>
            </div>
            <div>
              <span className="meta-label text-muted-foreground">Date: </span>
              <span className="meta-value font-semibold">
                {new Date(letterData.letterDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Recipient */}
          <div className="recipient mb-8 space-y-1 text-sm">
            <div className="recipient-line recipient-name font-semibold">{letterData.staffName}</div>
            <div className="recipient-line text-muted-foreground">Staff ID: {letterData.staffId}</div>
            <div className="recipient-line text-muted-foreground">{letterData.currentPosition}</div>
            <div className="recipient-line text-muted-foreground">{letterData.department}</div>
            <div className="recipient-line text-muted-foreground">{letterData.faculty}</div>
            <div className="recipient-line text-muted-foreground">University of Mines and Technology</div>
            <div className="recipient-line text-muted-foreground">Tarkwa, Ghana</div>
          </div>

          {/* Salutation */}
          <div className="mb-6 text-sm">
            <div className="salutation font-semibold mb-4">Dear {letterData.staffName.split(" ").slice(1).join(" ")},</div>

            {/* Main Content */}
            <div className="space-y-4 text-justify text-sm leading-7">
              <p className="subject font-semibold">
                RE: Notification of Promotion to {letterData.nextPosition}
              </p>

              <p className="body-text">
                We are delighted to inform you that your application for promotion to the position of{" "}
                <span className="font-semibold">{letterData.nextPosition}</span> has been carefully reviewed and
                evaluated by the appropriate university bodies in accordance with the promotion guidelines and
                regulations of the University of Mines and Technology.
              </p>

              {/* Performance Summary */}
              <div className="performance-box bg-muted/30 p-4 rounded-lg border border-border my-4">
                <div className="performance-title font-semibold mb-3 text-foreground">Performance Evaluation Summary</div>
                <div className="performance-grid grid grid-cols-3 gap-4 text-sm">
                  <div className="performance-item text-center">
                    <div className="performance-label text-muted-foreground">Teaching</div>
                    <div className="performance-value font-semibold text-primary text-lg">{letterData.teachingPerformance}</div>
                  </div>
                  <div className="performance-item text-center">
                    <div className="performance-label text-muted-foreground">Publications</div>
                    <div className="performance-value font-semibold text-secondary text-lg">{letterData.publicationPerformance}</div>
                  </div>
                  <div className="performance-item text-center">
                    <div className="performance-label text-muted-foreground">Service</div>
                    <div className="performance-value font-semibold text-success text-lg">{letterData.servicePerformance}</div>
                  </div>
                </div>
              </div>

              <p className="body-text">
                Your comprehensive portfolio demonstrates{" "}
                <span className="italic">{letterData.overallPerformance.toLowerCase()}</span> performance across all
                evaluated dimensions. Specifically, your contributions in teaching, scholarly publications, and
                institutional service have been recognized as meeting and exceeding the rigorous standards expected for
                this level of advancement.
              </p>

              <p className="body-text">
                You have successfully met all eligibility requirements, including the minimum tenure of{" "}
                <span className="font-semibold">{letterData.yearsRequired} years</span> in your current position, which
                you have fulfilled with <span className="font-semibold">{letterData.yearsInCurrentPosition} years</span> of
                distinguished service.
              </p>

              <p className="body-text">
                <span className="font-semibold">Effective Date:</span> Your promotion to the position of{" "}
                <span className="font-semibold">{letterData.nextPosition}</span> shall be effective from{" "}
                <span className="font-semibold">
                  {new Date(letterData.approvalDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>. You will be entitled to all benefits, privileges, and responsibilities associated with this new
                position as outlined in the University's salary and benefits schedules.
              </p>

              <p className="body-text">
                <span className="font-semibold">Reporting Requirements:</span> Please coordinate with the Human Resources
                Department to finalize all administrative formalities related to your new position. A formal letter of
                appointment will be issued separately.
              </p>

              <p className="body-text">
                We express our sincere appreciation for your dedicated service and your contributions to the academic
                excellence and development of the University of Mines and Technology. Your promotion reflects the
                University's commitment to recognizing and rewarding outstanding academic performance and leadership.
              </p>

              <p className="body-text">
                Congratulations on this well-deserved advancement. We wish you continued success and impact in your new
                role.
              </p>
            </div>

            {/* Closing */}
            <div className="closing mt-8 pt-8">
              <div className="mb-12">
                <div className="text-sm">Yours sincerely,</div>
              </div>

              <div className="signature-block space-y-1 text-sm">
                <div className="signatory-name font-semibold">{letterData.approvedBy}</div>
                <div className="signatory-title text-muted-foreground">{letterData.approverTitle}</div>
                <div className="text-muted-foreground">University of Mines and Technology</div>
                <div className="text-muted-foreground">Tarkwa, Ghana</div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer mt-12 pt-6 border-t border-muted text-xs text-muted-foreground text-center space-y-1">
              <div>University of Mines and Technology | Tarkwa, Ghana</div>
              <div>Tel: +233 (0)3106-22143 | Website: www.umat.edu.gh</div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-success" />
                <span>Verified: {letterData.applicationId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PromotionLetter);
