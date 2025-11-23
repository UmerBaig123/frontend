import React from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileText, 
  BarChart2, 
  ArrowRight,
  Settings,
  Cpu,
  Bot
} from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { useCompanyInfo } from "@/hooks/use-company-info";
import { useAuth } from "@/hooks/use-auth";

const Index = () => {
  const { companyInfo } = useCompanyInfo();
  const { isAuthenticated } = useAuth();
  
  // Redirect to dashboard if user is authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  // Default values in case company info is not set
  const slogan = companyInfo.slogan || "Smarter Bids Powered by AI";
  const businessDescription = companyInfo.businessDescription || 
    "Upload historical data, scan floor plans, and generate accurate bids with the power of artificial intelligence.";

  return (
    // <PageContainer>
    <div>
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-8 md:mb-0">
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-8 text-primary font-sans">
                {slogan}
              </h1>
              <p className="text-2xl mb-10 text-muted-foreground font-sans">
                {businessDescription}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-accent hover:bg-primary text-white rounded-full shadow-lg px-8 py-4 text-lg font-semibold">
                    Login <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">BP</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">BidPro Platform</h3>
                    <p className="text-gray-500 dark:text-gray-400">AI-Powered Bid Generation</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-14 text-primary">
            How BidPro Works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-surface dark:bg-gray-900 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-800">
              <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
                <Upload className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Upload Data</h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                Import historical bid data, pricing information, and floor plans in various formats.
              </p>
            </div>
            
            <div className="bg-surface dark:bg-gray-900 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-800">
              <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
                <Cpu className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">AI Analysis</h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                Our AI analyzes patterns, identifies cost drivers, and creates predictive models from your data.
              </p>
            </div>
            
            <div className="bg-surface dark:bg-gray-900 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-800">
              <div className="h-14 w-14 rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Generate Bids</h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                Create accurate, customizable bids and export professional PDFs for client presentation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="my-16 border-gray-200 dark:border-gray-700" />

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-12 md:p-16 text-center shadow-xl">
            <h2 className="text-4xl font-extrabold mb-6 text-white">
              Ready to Optimize Your Bidding Process?
            </h2>
            <p className="text-2xl mb-10 text-white/90 max-w-2xl mx-auto">
              Start using BidPro today and see how our AI-powered platform can save you time and improve your bid accuracy.
            </p>
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-accent hover:text-white border-white rounded-full px-10 py-4 text-lg font-semibold shadow-md">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </section>
    {/* // </PageContainer> */}
    </div>
  );
};

export default Index;
