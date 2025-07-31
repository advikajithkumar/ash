import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Home, BookOpen, Target, Calendar, BarChart2, FileText, Link as LinkIcon, Upload, Check, X, ChevronsRight, Globe, AlertTriangle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, getDoc } from 'firebase/firestore';

// --- IMPORTANT: PASTE YOUR FIREBASE CONFIG HERE ---
// Replace this object with the one you copied from your Firebase project setup.
const firebaseConfig = {
  apiKey: "AIzaSyDKKCRG6kLbI8wQAD-sbE8SiyOUjq1G_bE",
  authDomain: "advik-study.firebaseapp.com",
  projectId: "advik-study",
  storageBucket: "advik-study.firebasestorage.app",
  messagingSenderId: "445992809856",
  appId: "1:445992809856:web:105e09620a8cfbde197d65",
  measurementId: "G-KZCMCRDQXT"
};

// --- DATA STORE (Default structure if no data is found in Firebase) ---
const initialStudyData = {
  maths: { name: "Mathematics (Adv & Ext 1)", icon: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 12-8-8"/><path d="m20 4-8 8"/><path d="M4 20c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6Z"/><path d="M18 14c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4Z"/></svg>, uploadedWorksheets: [], uploadedResources: [], modules: [ { id: 'm1', title: 'MA-F1 & ME-F1: Functions', topics: [ { id: 't1', title: 'Graphical Relationships', objective: 'Understand domain/range, and transformations of graphs.', completed: false, score: null, maxScore: 25, resources: [{ name: 'Eddie Woo', url: 'https://www.youtube.com/c/misterwootube' }], worksheets: [{ name: 'THSC Online', url: 'https://www.thsc.online/' }] }, { id: 't2', title: 'Polynomials (Ext 1)', objective: 'Master polynomial functions, parameters, and solving polynomial equations.', completed: false, score: null, maxScore: 20, resources: [{ name: 'Khan Academy', url: 'https://www.khanacademy.org/math' }], worksheets: [{ name: 'Topic Tests', url: 'https://www.thsc.online/topic-tests' }] }, ]}, { id: 'm2', title: 'MA-T & ME-T: Trigonometric Functions', topics: [ { id: 't3', title: 'Trigonometry & Measure of Angles', objective: 'Master trig functions, identities, and equations in radians.', completed: false, score: null, maxScore: 30, resources: [{ name: 'Eddie Woo', url: 'https://www.youtube.com/c/misterwootube' }], worksheets: [{ name: 'Practice Sheet', url: 'https://www.google.com/search?q=NSW+Maths+Advanced+Trigonometry+Worksheet+PDF' }] }, { id: 't4', title: 'Inverse Trig Functions (Ext 1)', objective: 'Understand and apply inverse trig functions and their graphs.', completed: false, score: null, maxScore: 20, resources: [{ name: 'Desmos', url: 'https://www.desmos.com/calculator' }], worksheets: [{ name: 'Practice Qs', url: 'https://www.google.com/search?q=Inverse+Trigonometric+Functions+Worksheet' }] }, ]}, { id: 'm3', title: 'MA-C1 & ME-C1: Calculus', topics: [ { id: 't5', title: 'Introduction to Differentiation', objective: 'Apply differentiation rules (product, quotient, chain) to curves.', completed: false, score: null, maxScore: 40, resources: [{ name: 'Eddie Woo', url: 'https://www.youtube.com/c/misterwootube' }], worksheets: [{ name: 'Practice Problems', url: 'https://www.google.com/search?q=Chain+Rule+Practice+Problems+PDF' }] }, { id: 't6', title: 'Further Calculus Skills (Ext 1)', objective: 'Differentiate trig, exponential, and logarithmic functions.', completed: false, score: null, maxScore: 35, resources: [{ name: 'Math LibreTexts', url: 'https://math.libretexts.org/Bookshelves/Calculus' }], worksheets: [{ name: 'Practice Qs', url: 'https://www.google.com/search?q=Calculus+Worksheet+Derivatives' }] }, ]}, ]},
  chemistry: { name: "Chemistry", icon: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.2 3.8 21 8l-2.7 2.7c-.2.2-.5.2-.7 0l-1-1c-.2-.2-.2-.5 0-.7Z"/><path d="M12.5 6.5 7 12l-1.7-1.7c-.2-.2-.5-.2-.7 0l-1 1c-.2-.2-.2-.5 0-.7L6.3 8"/><path d="m12 7 6.5 6.5"/><path d="M12.5 17.5 18 12l1.7 1.7c.2.2.5.2.7 0l1-1c-.2-.2.2-.5 0-.7L18.7 9"/><path d="M7 12.5 1.5 7"/><path d="M3.8 16.2 8 21l2.7-2.7c-.2-.2.2-.5 0-.7l-1-1c-.2-.2-.5-.2-.7 0Z"/></svg>, uploadedWorksheets: [], uploadedResources: [], modules: [ { id: 'm1', title: 'Module 1: Properties and Structure of Matter', topics: [ { id: 't1', title: 'Periodicity & Bonding', objective: 'Analyse trends in the periodic table and types of chemical bonds.', completed: false, score: null, maxScore: 25, resources: [{ name: 'Phet Sims', url: 'https://phet.colorado.edu/en/simulations/filter?subjects=chemistry' }], worksheets: [{ name: 'Worksheet', url: 'https://www.google.com/search?q=Periodicity+and+Bonding+Worksheet' }] }, ]}, { id: 'm2', title: 'Module 2: Introduction to Quantitative Chemistry', topics: [ { id: 't2', title: 'The Mole Concept & Stoichiometry', objective: 'Perform calculations using moles, molar mass, and balanced equations.', completed: false, score: null, maxScore: 30, resources: [{ name: 'Khan Academy', url: 'https://www.khanacademy.org/science/chemistry/chemical-reactions-stoichiometry' }], worksheets: [{ name: 'Practice Qs', url: 'https://www.google.com/search?q=Stoichiometry+practice+problems+with+answers' }] }, ]}, { id: 'm3', title: 'Module 3: Reactive Chemistry', topics: [ { id: 't3', title: 'Rates of Reactions', objective: 'Understand and calculate rates of reaction and collision theory.', completed: false, score: null, maxScore: 25, resources: [{ name: 'LibreTexts', url: 'https://chem.libretexts.org/Bookshelves/General_Chemistry' }], worksheets: [{ name: 'Practice Qs', url: 'https://www.google.com/search?q=Rates+of+Reaction+Worksheet' }] }, ]}, { id: 'm4', title: 'Module 4: Drivers of Reaction', topics: [ { id: 't4', title: 'Energy Changes & Enthalpy', objective: 'Understand Enthalpy (ΔH), Endothermic vs. Exothermic reactions.', completed: false, score: null, maxScore: 30, resources: [{ name: 'Atomi', url: 'https://getatomi.com/' }], worksheets: [{ name: 'Hess\'s Law Practice', url: 'https://www.chem.ucla.edu/~harding/IGOC/H/hesslaw.html' }] }, ]}, ]},
  english: { name: "English Advanced", icon: BookOpen, uploadedWorksheets: [], uploadedResources: [], modules: [ { id: 'm1', title: 'Common Module: Reading to Write', topics: [ { id: 't1', title: 'Textual Analysis & Essay Writing', objective: 'Analyse texts and articulate purpose and context in a sophisticated manner.', completed: false, score: null, maxScore: 25, resources: [{ name: 'Art of Smart', url: 'https://artofsmart.com.au/' }], worksheets: [{ name: 'Past Papers', url: 'https://www.nsw.gov.au/education-and-training/nesa/past-hsc-exam-papers' }] }, ]}, { id: 'm2', title: 'Module A: Textual Conversations', topics: [ { id: 't2', title: 'Comparative Study', objective: 'Compare a pair of prescribed texts, analysing their connections.', completed: false, score: null, maxScore: 25, resources: [{ name: 'Your Texts', url: '#' }], worksheets: [{ name: 'Essay Questions', url: 'https://www.google.com/search?q=HSC+English+Module+A+essay+questions' }] }, ]}, { id: 'm3', title: 'Module B: Critical Study of Literature', topics: [ { id: 't3', title: 'In-depth Textual Analysis', objective: 'Develop a detailed analytical and critical response to a text.', completed: false, score: null, maxScore: 25, resources: [{ name: 'Your Text', url: '#' }], worksheets: [{ name: 'Essay Questions', url: 'https://www.google.com/search?q=HSC+English+Module+B+essay+questions' }] }, ]}, ]},
  pdhpe: { name: "PDHPE", icon: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M5 12a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2"/><path d="M5 12a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2"/></svg>, uploadedWorksheets: [], uploadedResources: [], modules: [ { id: 'm1', title: 'Core 1: Better Health for Individuals', topics: [ { id: 't1', title: 'Social Constructs of Health', objective: 'Analyse how factors like socioeconomic status and culture shape health.', completed: false, score: null, maxScore: 15, resources: [{ name: 'PDHPE.net', url: 'http://pdhpe.net/better-health-for-individuals/' }], worksheets: [{ name: 'AIHW Data', url: 'https://www.aihw.gov.au/' }] }, ]}, { id: 'm2', title: 'Core 2: The Body in Motion', topics: [ { id: 't2', title: 'Anatomy & Physiology', objective: 'Understand anatomical terminology and function of body systems.', completed: false, score: null, maxScore: 30, resources: [{ name: 'CrashCourse', url: 'https://www.youtube.com/playlist?list=PL8dPuuaLjXtOAKed_MxxWBNaPno5h3Zs8' }], worksheets: [{ name: 'Anatomy Labelling', url: 'https://www.google.com/search?q=Anatomy+labelling+worksheet+PDF' }] }, ]}, { id: 'm3', title: 'Options (Study 2 of 4)', topics: [ { id: 't3', title: 'Option: First Aid', objective: 'Develop skills and knowledge for assessing and managing first aid scenarios.', completed: false, score: null, maxScore: 20, resources: [{ name: 'St John Ambulance', url: 'https://www.stjohn.org.au/first-aid-facts/' }], worksheets: [{ name: 'Scenario Practice', url: 'https://www.google.com/search?q=first+aid+scenarios+and+answers+pdf' }] }, { id: 't4', title: 'Option: Fitness Choices', objective: 'Critically analyse fitness choices and develop personal fitness plans.', completed: false, score: null, maxScore: 20, resources: [{ name: 'AIS', url: 'https://www.ais.gov.au/' }], worksheets: [{ name: 'Program Design', url: 'https://www.google.com/search?q=fitness+program+design+template' }] }, ]}, ]},
  agriculture: { name: "Agriculture", icon: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13V6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1"/><path d="M11 20v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/><path d="M11 20a7 7 0 0 1 7-7h0"/><path d="M18 20a3 3 0 0 1-3-3V6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1"/></svg>, uploadedWorksheets: [], uploadedResources: [], modules: [ { id: 'm1', title: 'Preliminary Content', topics: [ { id: 't1', title: 'Overview of Australian Agriculture', objective: 'Understand the scope and importance of Australian agriculture.', completed: false, score: null, maxScore: 15, resources: [{ name: 'ABARES', url: 'https://www.agriculture.gov.au/abares' }], worksheets: [{ name: 'Industry Stats', url: 'https://www.nff.org.au/get-the-facts/' }] }, { id: 't2', title: 'Basic Animal and Plant Physiology', objective: 'Understand fundamental biological processes in agricultural species.', completed: false, score: null, maxScore: 20, resources: [{ name: 'Tocal College', url: 'https://www.tocal.nsw.edu.au/publications' }], worksheets: [{ name: 'Diagrams', url: 'https://www.google.com/search?q=plant+and+animal+cell+diagram+worksheet' }] }, ]}, { id: 'm2', title: 'Production Systems Case Study', topics: [ { id: 't3', title: 'Plant Production: Wheat', objective: 'Investigate wheat production from sowing to market.', completed: false, score: null, maxScore: 25, resources: [{ name: 'NSW DPI', url: 'https://www.dpi.nsw.gov.au/' }], worksheets: [{ name: 'Past HSC Qs', url: 'https://www.nsw.gov.au/education-and-training/nesa/past-hsc-exam-papers' }] }, { id: 't4', title: 'Animal Production: Prime Lambs', objective: 'Evaluate prime lamb production operations and challenges.', completed: false, score: null, maxScore: 25, resources: [{ name: 'Meat & Livestock Aus', url: 'https://www.mla.com.au/' }], worksheets: [{ name: 'Case Study Guide', url: 'https://www.google.com/search?q=agriculture+case+study+template' }] }, ]}, ]}
};

const calendarStructure = [
    { day: 'Monday', tasks: ['Maths', 'English', 'Chemistry', 'Agriculture'] },
    { day: 'Tuesday', tasks: ['Chemistry', 'Agriculture', 'Maths', 'PDHPE'] },
    { day: 'Wednesday', tasks: ['Maths', 'English', 'PDHPE', 'Chemistry'] },
    { day: 'Thursday', tasks: ['PDHPE', 'Chemistry', 'English', 'Maths'] },
    { day: 'Friday', tasks: ['Maths', 'PDHPE', 'Agriculture', 'English'] },
    { day: 'Saturday', tasks: ['Chemistry (Past Paper)', 'Agriculture (Past Paper)', 'English (Essay)', 'Maths (Review)'] },
    { day: 'Sunday', tasks: ['Weekly Review', 'Organise Notes', 'Plan Next Week', 'Recharge'] },
];

const initialCalendarStatus = () => {
    const status = {};
    calendarStructure.forEach(day => {
        status[day.day] = day.tasks.map(() => 'Pending');
    });
    return status;
};


// --- HELPER COMPONENTS ---

const Topic = ({ topic, subjectId, moduleId, onToggleComplete, onSetScore }) => {
  const [localScore, setLocalScore] = useState(topic.score ?? '');
  const [error, setError] = useState('');

  const handleScoreChange = (e) => {
    setError('');
    setLocalScore(e.target.value);
  };

  const handleSaveScore = () => {
    const newScore = parseInt(localScore, 10);
    if (!isNaN(newScore) && newScore >= 0 && newScore <= topic.maxScore) {
      onSetScore(subjectId, moduleId, topic.id, newScore);
      setError('');
    } else {
      setError(`Score must be 0-${topic.maxScore}`);
      setLocalScore(topic.score ?? '');
    }
  };
  
  useEffect(() => {
    setLocalScore(topic.score ?? '');
  }, [topic.score]);

  const scorePercentage = topic.score !== null ? (topic.score / topic.maxScore) * 100 : 0;

  return (
    <div className={`p-4 rounded-lg transition-all duration-300 ${topic.completed ? 'bg-emerald-900/50 border-emerald-700' : 'bg-gray-800/50 border-gray-700'} border`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={topic.completed}
            onChange={() => onToggleComplete(subjectId, moduleId, topic.id)}
            className="mt-1 h-5 w-5 rounded bg-gray-700 border-gray-600 text-emerald-500 focus:ring-emerald-600 cursor-pointer"
          />
          <div>
            <h4 className={`font-bold text-lg ${topic.completed ? 'line-through text-gray-400' : 'text-white'}`}>{topic.title}</h4>
            <div className="flex items-center text-sm text-gray-400 mt-1">
              <Target className="w-4 h-4 mr-2" />
              <p>{topic.objective}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2 w-48 ml-4">
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={localScore}
              onChange={handleScoreChange}
              placeholder="Score"
              className={`w-20 bg-gray-900 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-md px-2 py-1 text-white text-center focus:ring-emerald-500 focus:border-emerald-500`}
              min="0"
              max={topic.maxScore}
            />
            <span className="text-gray-400">/ {topic.maxScore}</span>
            <button onClick={handleSaveScore} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition-colors">Save</button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          {topic.score !== null && (
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${scorePercentage}%` }}></div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 pl-8 border-t border-gray-700 pt-3">
        <h5 className="font-semibold text-gray-300 mb-2">Resources</h5>
        <div className="flex flex-wrap gap-2">
          {topic.resources.map(r => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm bg-blue-900/50 hover:bg-blue-800/70 text-blue-300 px-3 py-1 rounded-full transition-colors">
              <LinkIcon className="w-3 h-3 mr-2"/> {r.name}
            </a>
          ))}
          {topic.worksheets.map(w => (
            <a key={w.name} href={w.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm bg-purple-900/50 hover:bg-purple-800/70 text-purple-300 px-3 py-1 rounded-full transition-colors">
              <FileText className="w-3 h-3 mr-2"/> {w.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGES ---

const Dashboard = ({ subjects }) => {
  const progressData = useMemo(() => {
    if (!subjects) return { overall: 0, subjectProgress: [], completedTopics: 0, totalTopics: 0 };
    let totalTopics = 0;
    let completedTopics = 0;
    const subjectProgress = Object.keys(subjects).map(key => {
      const subject = subjects[key];
      let subjectTotal = 0;
      let subjectCompleted = 0;
      subject.modules.forEach(mod => {
        subjectTotal += mod.topics.length;
        subjectCompleted += mod.topics.filter(t => t.completed).length;
      });
      totalTopics += subjectTotal;
      completedTopics += subjectCompleted;
      return {
        name: subject.name,
        progress: subjectTotal > 0 ? (subjectCompleted / subjectTotal) * 100 : 0,
        completed: subjectCompleted,
        total: subjectTotal,
      };
    });
    return { overall: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0, subjectProgress, completedTopics, totalTopics };
  }, [subjects]);

  const scoreData = useMemo(() => {
    if (!subjects) return [];
    return Object.keys(subjects).map(key => {
      const subject = subjects[key];
      let totalScore = 0;
      let totalMaxScore = 0;
      subject.modules.forEach(mod => {
        mod.topics.forEach(topic => {
          if (topic.score !== null) {
            totalScore += topic.score;
            totalMaxScore += topic.maxScore;
          }
        });
      });
      return {
        name: subject.name,
        average: totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0,
      };
    });
  }, [subjects]);

  const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">Here's your progress at a glance. Keep up the great work!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Overall Progress</h3>
          <p className="text-5xl font-bold text-emerald-400">{progressData.overall.toFixed(1)}%</p>
          <p className="text-gray-400 mt-2">{progressData.completedTopics} of {progressData.totalTopics} topics completed</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg col-span-2">
           <h3 className="text-lg font-semibold text-gray-300 mb-4">Subject Completion</h3>
           <ResponsiveContainer width="100%" height={120}>
            <BarChart data={progressData.subjectProgress} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide/>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                labelStyle={{ color: '#d1d5db' }}
                formatter={(value) => `${value.toFixed(0)}%`}
              />
              <Bar dataKey="progress" fill="#10b981" barSize={20} radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Average Score by Subject</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" unit="%" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                        labelStyle={{ color: '#d1d5db' }}
                        formatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Legend />
                    <Bar dataKey="average" name="Average Score (%)" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Completed Topics Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={progressData.subjectProgress}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="completed"
                        nameKey="name"
                        label={({ name, percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                    >
                        {progressData.subjectProgress.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                        labelStyle={{ color: '#d1d5db' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const SubjectPage = ({ subject, subjectId, onUpdateData }) => {
    const [worksheetName, setWorksheetName] = useState('');
    const [worksheetUrl, setWorksheetUrl] = useState('');
    const [resourceName, setResourceName] = useState('');
    const [resourceUrl, setResourceUrl] = useState('');

    const handleUploadWorksheet = (e) => {
        e.preventDefault();
        if (worksheetName && worksheetUrl) {
            const newWorksheets = [...(subject.uploadedWorksheets || []), { name: worksheetName, url: worksheetUrl }];
            onUpdateData(`subjects.${subjectId}.uploadedWorksheets`, newWorksheets);
            setWorksheetName('');
            setWorksheetUrl('');
        }
    };

    const handleUploadResource = (e) => {
        e.preventDefault();
        if (resourceName && resourceUrl) {
            const newResources = [...(subject.uploadedResources || []), { name: resourceName, url: resourceUrl }];
            onUpdateData(`subjects.${subjectId}.uploadedResources`, newResources);
            setResourceName('');
            setResourceUrl('');
        }
    };

    const handleToggleComplete = (moduleId, topicId) => {
        const moduleIndex = subject.modules.findIndex(m => m.id === moduleId);
        const topicIndex = subject.modules[moduleIndex].topics.findIndex(t => t.id === topicId);
        const currentStatus = subject.modules[moduleIndex].topics[topicIndex].completed;
        onUpdateData(`subjects.${subjectId}.modules.${moduleIndex}.topics.${topicIndex}.completed`, !currentStatus);
    };

    const handleSetScore = (moduleId, topicId, score) => {
        const moduleIndex = subject.modules.findIndex(m => m.id === moduleId);
        const topicIndex = subject.modules[moduleIndex].topics.findIndex(t => t.id === topicId);
        onUpdateData(`subjects.${subjectId}.modules.${moduleIndex}.topics.${topicIndex}.score`, score);
    };

    return (
        <div className="p-8">
            <div className="flex items-center mb-8">
                <subject.icon className="w-12 h-12 text-emerald-400 mr-4" />
                <h1 className="text-4xl font-bold text-white">{subject.name}</h1>
            </div>
            <div className="space-y-8">
                {subject.modules.map(module => (
                    <div key={module.id}>
                        <h2 className="text-2xl font-semibold text-gray-300 mb-4 pb-2 border-b-2 border-gray-700 flex items-center"><ChevronsRight className="w-6 h-6 mr-2 text-emerald-400"/>{module.title}</h2>
                        <div className="space-y-4">
                            {module.topics.map(topic => (
                                <Topic
                                    key={topic.id}
                                    topic={topic}
                                    subjectId={subjectId}
                                    moduleId={module.id}
                                    onToggleComplete={() => handleToggleComplete(module.id, topic.id)}
                                    onSetScore={(score) => handleSetScore(module.id, topic.id, score)}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Worksheet Upload Section */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-4 pb-2 border-b-2 border-gray-700 flex items-center"><Upload className="w-6 h-6 mr-2 text-emerald-400"/>My Worksheets</h2>
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                        <form onSubmit={handleUploadWorksheet} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Worksheet Name</label>
                                <input type="text" value={worksheetName} onChange={e => setWorksheetName(e.target.value)} placeholder="e.g., Hess's Law Practice" className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Link (URL)</label>
                                <input type="url" value={worksheetUrl} onChange={e => setWorksheetUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                            <button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors">
                                <Upload className="w-4 h-4 mr-2"/> Add Worksheet
                            </button>
                        </form>
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-200 mb-2">Uploaded:</h3>
                            {subject.uploadedWorksheets && subject.uploadedWorksheets.length > 0 ? (
                                <ul className="space-y-2">
                                    {subject.uploadedWorksheets.map((ws, index) => (
                                        <li key={index} className="flex items-center justify-between bg-gray-900/70 p-3 rounded-md">
                                            <span className="text-gray-300">{ws.name}</span>
                                            <a href={ws.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                                                View <LinkIcon className="w-3 h-3 ml-2"/>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm">No worksheets uploaded yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resource Upload Section */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-4 pb-2 border-b-2 border-gray-700 flex items-center"><Globe className="w-6 h-6 mr-2 text-emerald-400"/>My Resources</h2>
                    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                        <form onSubmit={handleUploadResource} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Resource Name</label>
                                <input type="text" value={resourceName} onChange={e => setResourceName(e.target.value)} placeholder="e.g., Chemistry PDF" className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-300 mb-1">Link (URL)</label>
                                <input type="url" value={resourceUrl} onChange={e => setResourceUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-emerald-500 focus:border-emerald-500" />
                            </div>
                            <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors">
                                <Globe className="w-4 h-4 mr-2"/> Add Resource
                            </button>
                        </form>
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-200 mb-2">Saved Resources:</h3>
                            {subject.uploadedResources && subject.uploadedResources.length > 0 ? (
                                <ul className="space-y-2">
                                    {subject.uploadedResources.map((res, index) => (
                                        <li key={index} className="flex items-center justify-between bg-gray-900/70 p-3 rounded-md">
                                            <span className="text-gray-300">{res.name}</span>
                                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-400 hover:text-blue-300">
                                                Open <LinkIcon className="w-3 h-3 ml-2"/>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-sm">No resources added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CalendarPage = ({ status, onUpdateStatus }) => {
  const timeSlots = ["4:00-4:50 PM", "5:00-5:50 PM", "7:30-8:20 PM", "8:30-9:20 PM"];

  const getStatusColor = (currentStatus) => {
    switch(currentStatus) {
        case 'Done': return 'bg-emerald-800/60 border-emerald-700';
        case 'Missed': return 'bg-red-800/60 border-red-700';
        default: return 'bg-gray-800/30';
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Weekly Study Calendar</h1>
      <div className="bg-gray-800 rounded-lg overflow-x-auto">
        <div className="grid grid-cols-8 min-w-[1000px]">
            <div className="p-4 font-bold text-gray-300 border-b border-r border-gray-700 sticky left-0 bg-gray-800">Time</div>
            {calendarStructure.map(d => <div key={d.day} className="p-4 font-bold text-center text-gray-300 border-b border-r border-gray-700">{d.day}</div>)}
        
            {timeSlots.map((time, timeIndex) => (
                <React.Fragment key={time}>
                    <div className="p-4 font-semibold text-gray-400 border-r border-gray-700 sticky left-0 bg-gray-800">{time}</div>
                    {calendarStructure.map((dayData) => (
                        <div key={`${dayData.day}-${time}`} className={`p-2 text-center border-r border-gray-700 flex flex-col justify-center items-center gap-2 transition-colors ${status[dayData.day][timeIndex]}`}>
                            <span className="text-gray-200 text-sm">{dayData.tasks[timeIndex]}</span>
                            <div className="flex space-x-2">
                                <button onClick={() => onUpdateStatus(dayData.day, timeIndex, 'Done')} className="p-1 rounded-full bg-green-500/20 hover:bg-green-500/40 text-green-300"><Check className="w-4 h-4"/></button>
                                <button onClick={() => onUpdateStatus(dayData.day, timeIndex, 'Missed')} className="p-1 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300"><X className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [appData, setAppData] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [userId, setUserId] = useState(null);
  const [db, setDb] = useState(null);
  const [configError, setConfigError] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  // Initialize Firebase and Auth
  useEffect(() => {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        setConfigError(true);
        return;
    }

    setLoadingMessage("Connecting to Firebase...");
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setDb(firestore);

    onAuthStateChanged(auth, user => {
      if (user) {
        setLoadingMessage("User authenticated. Fetching data...");
        setUserId(user.uid);
      } else {
        setLoadingMessage("Creating a secure session...");
        signInAnonymously(auth).catch(error => {
          console.error("Anonymous sign-in failed:", error);
          setLoadingMessage("Error: Could not create a secure session.");
        });
      }
    });
  }, []);

  // Listen for data changes from Firestore
  useEffect(() => {
    if (!db || !userId) return;

    const docRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAppData(docSnap.data());
      } else {
        setLoadingMessage("No save file found. Creating a new one...");
        const initialData = {
          subjects: initialStudyData,
          calendar: initialCalendarStatus()
        };
        setDoc(docRef, initialData).then(() => {
          setAppData(initialData);
        }).catch(e => console.error("Error creating initial document:", e));
      }
    }, (error) => {
        console.error("Firestore snapshot error:", error);
        setLoadingMessage("Error: Could not connect to the database.");
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [db, userId]);

  // Function to update a specific part of the data in Firestore
  const handleUpdateData = async (path, value) => {
    if (!db || !userId) return;
    const docRef = doc(db, 'users', userId);
    try {
      await updateDoc(docRef, { [path]: value });
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };
  
  const handleUpdateCalendarStatus = (day, taskIndex, status) => {
    const newStatus = { ...appData.calendar };
    newStatus[day][taskIndex] = status;
    handleUpdateData('calendar', newStatus);
  };

  if (configError) {
    return (
        <div className="bg-red-900 text-white min-h-screen flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-300 mb-6" />
            <h1 className="text-4xl font-bold mb-4">Firebase Configuration Missing</h1>
            <p className="text-xl mb-8 max-w-2xl">You need to add your unique Firebase configuration keys to the `App.jsx` file. Please replace the placeholder object with your actual keys.</p>
            <div className="bg-gray-800 p-4 rounded-lg text-left text-sm font-mono">
                <code>
                    // 1. Go to your Firebase project settings.<br/>
                    // 2. Find your web app configuration.<br/>
                    // 3. Copy the firebaseConfig object.<br/>
                    // 4. Paste it into App.jsx, replacing the placeholder.
                </code>
            </div>
        </div>
    );
  }

  const renderPage = () => {
    if (!appData) {
      return <div className="w-full h-screen flex items-center justify-center text-white">{loadingMessage}</div>;
    }

    if (activePage === 'dashboard') {
      return <Dashboard subjects={appData.subjects} />;
    }
    if (activePage === 'calendar') {
      return <CalendarPage status={appData.calendar} onUpdateStatus={handleUpdateCalendarStatus} />;
    }
    const subject = appData.subjects[activePage];
    if (subject) {
      return <SubjectPage 
        subject={subject} 
        subjectId={activePage} 
        onUpdateData={handleUpdateData}
      />;
    }
    return <Dashboard subjects={appData.subjects} />;
  };

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-gray-200 flex">
      {/* Sidebar */}
      <nav className="w-64 bg-gray-800/50 p-6 flex flex-col border-r border-gray-700 flex-shrink-0">
        <div className="flex items-center mb-12">
          <BarChart2 className="w-8 h-8 text-emerald-400" />
          <h1 className="text-xl font-bold ml-3 text-white">Advik's Study Hub</h1>
        </div>
        <ul className="space-y-2">
          <li>
            <button onClick={() => setActivePage('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activePage === 'dashboard' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-700'}`}>
              <Home className="w-5 h-5 mr-3" /> Dashboard
            </button>
          </li>
          <li className="pt-4 mt-4 border-t border-gray-700">
            <span className="text-xs font-semibold text-gray-500 px-4">SUBJECTS</span>
          </li>
          {appData && Object.keys(appData.subjects).map(key => {
            const subject = appData.subjects[key];
            const SubjectIcon = subject.icon;
            return (
              <li key={key}>
                <button onClick={() => setActivePage(key)} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activePage === key ? 'bg-emerald-600 text-white' : 'hover:bg-gray-700'}`}>
                  <SubjectIcon className="w-5 h-5 mr-3" /> {subject.name}
                </button>
              </li>
            );
          })}
           <li className="pt-4 mt-4 border-t border-gray-700">
            <button onClick={() => setActivePage('calendar')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activePage === 'calendar' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-700'}`}>
              <Calendar className="w-5 h-5 mr-3" /> Calendar
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}
