import {
  Bell,
  Search,
  Menu,
  User,
  Plus,
  Trash2,
  ArrowRight,
  Calendar as CalendarIcon,
  Check
} from "lucide-react";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Textarea } from "../components/textarea";
import { Switch } from "../components/switch";
import { Slider } from "../components/slider";
import { Checkbox } from "../components/checkbox";
import { RadioGroup, RadioGroupItem } from "../components/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "../components/card";
import { Alert, AlertTitle, AlertDescription } from "../components/alert";
import { Badge } from "../components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/avatar";
import { Skeleton } from "../components/skeleton";
import { Progress } from "../components/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

export function CoreComponents() {
  return (
    <div className="space-y-16 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Core Component Library</h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          Reusable UI elements designed for the LifeSync AI ecosystem.
        </p>
      </div>

      {/* 2.1 Buttons */}
      <Section title="2.1 Buttons" description="Primary, secondary, and functional action triggers.">
        <div className="flex flex-wrap items-center gap-4">
          <Button>Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link Button</Button>
          <Button size="icon"><Plus className="h-4 w-4" /></Button>
          <Button className="rounded-full">Rounded</Button>
        </div>
      </Section>

      {/* 2.2 Inputs */}
      <Section title="2.2 Inputs & Forms" description="Data entry components for user interaction.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" placeholder="hello@lifesync.ai" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" placeholder="Tell us about your goals..." />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <RadioGroup defaultValue="personal">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="r1" />
                  <Label htmlFor="r1">Personal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pro" id="r2" />
                  <Label htmlFor="r2">Pro</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Preferences</Label>
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <Label htmlFor="notifications">Enable Notifications</Label>
                <Switch id="notifications" />
              </div>
            </div>
            <div className="space-y-4">
              <Label>Sensitivity Level (0-100)</Label>
              <Slider defaultValue={[33]} max={100} step={1} />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">Accept terms and conditions</Label>
            </div>
          </div>
        </div>
      </Section>

      {/* 2.3 Cards */}
      <Section title="2.3 Cards" description="Container styles for various content types.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metric Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Daily Focus Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">84%</div>
              <p className="text-xs text-emerald-500 mt-1 flex items-center">
                <ArrowRight className="w-3 h-3 rotate-[-45deg] mr-1" /> +12% from yesterday
              </p>
            </CardContent>
          </Card>

          {/* Insight Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <CardHeader>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
                <Check className="w-4 h-4" />
              </div>
              <CardTitle className="text-lg">Morning Routine</CardTitle>
              <CardDescription>Streak: 12 Days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">You've consistently hit your meditation goals this week. Keep it up!</p>
            </CardContent>
          </Card>

          {/* Profile Summary Card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">Jane Doe</CardTitle>
                <CardDescription>Pro Member</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between text-sm text-slate-600 mt-2">
                <span>Level 5</span>
                <span>2,450 XP</span>
              </div>
              <Progress value={65} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* 2.5 Feedback */}
      <Section title="2.5 Feedback" description="User communication components.">
        <div className="space-y-4 max-w-2xl">
          <Alert>
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>You can add components to your app using the cli.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
          </Alert>
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </div>
      </Section>

      {/* 2.6 Data Viz */}
      <Section title="2.6 Data Visualizations" description="Recharts implementation for analytics.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Line Chart */}
          <Card>
            <CardHeader><CardTitle>Weekly Progress</CardTitle></CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <LineChart data={[
                  { name: 'Mon', value: 40 },
                  { name: 'Tue', value: 60 },
                  { name: 'Wed', value: 55 },
                  { name: 'Thu', value: 80 },
                  { name: 'Fri', value: 70 },
                  { name: 'Sat', value: 90 },
                  { name: 'Sun', value: 85 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader><CardTitle>Budget Spend</CardTitle></CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={[
                  { name: 'Food', value: 400 },
                  { name: 'Rent', value: 1200 },
                  { name: 'Util', value: 200 },
                  { name: 'Ent', value: 300 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card>
            <CardHeader><CardTitle>Personality Traits</CardTitle></CardHeader>
            <CardContent className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                  { subject: 'Openness', A: 120, fullMark: 150 },
                  { subject: 'Conscientious', A: 98, fullMark: 150 },
                  { subject: 'Extraversion', A: 86, fullMark: 150 },
                  { subject: 'Agreeableness', A: 99, fullMark: 150 },
                  { subject: 'Neuroticism', A: 85, fullMark: 150 },
                ]}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name="Mike" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </Section>

    </div>
  );
}

function Section({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
  return (
    <section className="space-y-6 border-b border-slate-200 pb-10 last:border-0">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
        {children}
      </div>
    </section>
  )
}
