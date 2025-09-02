"use client";

import React from "react";

export default function AIAgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-semibold text-purple-600 flex items-center justify-center gap-2">
          AI Agents<span className="text-yellow-400">✨</span>
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Discover the power of customizable AI agents. Select an agent that fits your needs, whether it's a Product manager, Engineering
          manager, Project manager, QA analyst, Digital marketer, Sales manager, or you can create your custom AI agent.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        {/* Sales Manager Card */}
        <div className="bg-purple-100 p-4 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-purple-200 p-2 rounded-full mb-2">
            <span className="text-purple-600">📓</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800">Sales Manager</h3>
          <p className="text-sm text-gray-600 mt-1">
            Leads sales teams to achieve revenue targets through strategy...
          </p>
          <button className="mt-4 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition">
            Use Agent
          </button>
        </div>

        {/* Engineering Manager Card */}
        <div className="bg-purple-100 p-4 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-purple-200 p-2 rounded-full mb-2">
            <span className="text-purple-600">🔧</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800">Engineering Manager</h3>
          <p className="text-sm text-gray-600 mt-1">
            Leads and mentors engineering teams while overseeing technical...
          </p>
          <button className="mt-4 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition">
            Use Agent
          </button>
        </div>

        {/* Digital Marketer Card */}
        <div className="bg-purple-100 p-4 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-purple-200 p-2 rounded-full mb-2">
            <span className="text-purple-600">📱</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800">Digital Marketer</h3>
          <p className="text-sm text-gray-600 mt-1">
            Develops and implements marketing strategies across digit...
          </p>
          <button className="mt-4 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition">
            Use Agent
          </button>
        </div>

        {/* Project Manager Card */}
        <div className="bg-purple-100 p-4 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-purple-200 p-2 rounded-full mb-2">
            <span className="text-purple-600">📊</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800">Project Manager</h3>
          <p className="text-sm text-gray-600 mt-1">
            Establishes team performance and KPIs to track...
          </p>
          <button className="mt-4 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition">
            Use Agent
          </button>
        </div>

        {/* Product Manager Card */}
        <div className="bg-purple-100 p-4 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-purple-200 p-2 rounded-full mb-2">
            <span className="text-purple-600">🏃</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800">Product Manager</h3>
          <p className="text-sm text-gray-600 mt-1">
            Leads product development from conception to launch, balancing...
          </p>
          <button className="mt-4 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition">
            Use Agent
          </button>
        </div>

        {/* QA Analyst Card */}
        <div className="bg-purple-100 p-4 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-purple-200 p-2 rounded-full mb-2">
            <span className="text-purple-600">🔍</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800">QA Analyst</h3>
          <p className="text-sm text-gray-600 mt-1">
            Ensures software quality through systematic testing and automate...
          </p>
          <button className="mt-4 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition">
            Use Agent
          </button>
        </div>

        {/* Create Agent Card */}
        <div className="bg-purple-100 p-4 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-purple-200 p-2 rounded-full mb-2">
            <span className="text-purple-600">✨</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800">Create Agent</h3>
          <button className="mt-4 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition">
            Create Agent
          </button>
        </div>

        {/* View All Agents Card */}
        <div className="bg-purple-100 p-4 rounded-lg shadow-md flex flex-col items-center text-center">
          <div className="bg-purple-200 p-2 rounded-full mb-2">
            <span className="text-purple-600">👀</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800">View All Agents</h3>
          <button className="mt-4 bg-black text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition">
            View All Agents →
          </button>
        </div>
      </div>

      {/* Footer with Input */}
      <div className="mt-auto w-full max-w-4xl mt-8">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
          <input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 text-sm text-gray-600 outline-none"
          />
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600">
              <span>📎</span>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <span>📩</span>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <span>🔗</span>
            </button>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-green-600">Gpt-4.1</span>
            <span className="text-xs text-gray-400">•</span>
            <select className="text-xs text-gray-600 bg-transparent border-none outline-none">
              <option>Output in - English</option>
            </select>
            <button className="text-gray-400 hover:text-gray-600">
              <span>🎙️</span>
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <span>🔍</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
