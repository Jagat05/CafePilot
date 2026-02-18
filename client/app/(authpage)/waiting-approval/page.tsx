"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Coffee,
  CheckCircle2,
  RefreshCw,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import API from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const WaitingApprovalPage = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [email, setEmail] = useState<string>("");

  // Get email from localStorage if available (set during login attempt)
  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingApprovalEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const checkApprovalStatus = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please try logging in again to check your status.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setIsChecking(true);
    try {
      // Check approval status using the dedicated endpoint
      const { data } = await API.post("/users/check-status", {
        email,
      });

      if (data.success) {
        if (data.approved) {
          // Account approved! Clear stored email and redirect to login
          localStorage.removeItem("pendingApprovalEmail");
          toast({
            title: "Account Approved! 🎉",
            description: "Your account has been approved. Please login to continue.",
          });

          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } else {
          toast({
            title: "Still Pending",
            description: `Your account status is: ${data.status}. Please wait for admin approval.`,
          });
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.message || "";
        
        if (error.response.status === 404) {
          toast({
            title: "Account Not Found",
            description: "Please register first or check your email.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errorMessage || "Unable to check status. Please try again later.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Unable to check status. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("pendingApprovalEmail");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-cream p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-card border-0">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-lg relative"
            >
              <Clock className="w-10 h-10 text-amber-600" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-amber-600"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-foreground">
                Waiting for Approval
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Your account is pending admin approval
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Message */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-900">
                    What happens next?
                  </p>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Our admin team will review your registration request. Once
                    approved, you&apos;ll be able to access your cafe dashboard
                    and start managing your business.
                  </p>
                </div>
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Registration Complete</p>
                  <p className="text-xs text-muted-foreground">
                    Your account has been created successfully
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Review in Progress</p>
                  <p className="text-xs text-muted-foreground">
                    Admin is reviewing your application
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <Coffee className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Get Started Soon</p>
                  <p className="text-xs text-muted-foreground">
                    You&apos;ll receive access once approved
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={checkApprovalStatus}
                disabled={isChecking}
                className="w-full h-12 bg-[#F39325] hover:bg-[#f1a34b]"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking Status...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Approval Status
                  </>
                )}
              </Button>

              <Button
                onClick={handleBackToLogin}
                variant="outline"
                className="w-full h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Need help? Contact our support team for assistance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-40 h-40 bg-orange-200/20 rounded-full blur-3xl -z-10"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </div>
  );
};

export default WaitingApprovalPage;
