import React from 'react';
import { Leaf, Mail, MapPin, Phone, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-slate-950 font-bold" />
              </div>
              <span className="font-bold text-lg text-white">EcoTrack</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise Carbon Footprint Monitoring System. Enabling organizations and individuals to track, analyze, and offset carbon emissions.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" className="hover:text-emerald-400 transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="hover:text-emerald-400 transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="hover:text-emerald-400 transition-colors"><Twitter className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-emerald-400 transition-colors">Problem Statement</a></li>
              <li><a href="#features" className="hover:text-emerald-400 transition-colors">System Features</a></li>
              <li><a href="#benefits" className="hover:text-emerald-400 transition-colors">Benefits</a></li>
              <li><a href="/register" className="hover:text-emerald-400 transition-colors">Register Account</a></li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Contact Support</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Infosys Development Center, Electronic City, Bengaluru, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support.carbon@infosys.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 (080) 1234-5678</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Carbon Footprint Monitoring System. Developed for Infosys Internship Milestone 1.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Security Audit</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
