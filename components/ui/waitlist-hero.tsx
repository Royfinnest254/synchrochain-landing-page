
"use client"

import React from "react";
import { GridBackground } from "./grid-background";
import { Input } from "./input";
import { Button } from "./button";
import { Avatar, AvatarFallback } from "./avatar";
import { Icons } from "./icons";

export const WaitlistHero = () => {
  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden">
      <GridBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-xl mx-auto p-8 space-y-12">
          <div className="space-y-6 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-br from-gray-200 to-gray-600">
              Join Our Product Launch Waitlist
            </h2>
            <p className="text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
              Be part of something truly extraordinary. Join others
              already gaining early access to our revolutionary new coordination prototype.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-gray-950/50 border-gray-800 text-white placeholder:text-gray-600"
            />
            <Button
              className="h-12 px-6 bg-white hover:bg-gray-200 text-black font-bold whitespace-nowrap rounded-lg"
            >
              Get Notified
            </Button>
          </div>

          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-4 text-slate-300">
              <div className="flex -space-x-3">
                <Avatar className="border-2 border-black w-12 h-12 shadow-xl">
                  <AvatarFallback className="text-sm font-semibold bg-purple-600 text-white">JD</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-black w-12 h-12 shadow-xl">
                  <AvatarFallback className="text-sm font-semibold bg-blue-600 text-white">AS</AvatarFallback>
                </Avatar>
                <Avatar className="border-2 border-black w-12 h-12 shadow-xl">
                  <AvatarFallback className="text-sm font-semibold bg-blue-700 text-white">MK</AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="flex gap-6 justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icons.twitter className="w-5 h-5 fill-current" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icons.gitHub className="w-5 h-5 fill-current" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
