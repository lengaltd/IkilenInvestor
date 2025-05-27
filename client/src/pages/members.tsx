import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, Users, TrendingUp, DollarSign, Filter, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MemberSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  totalContributions: number;
  lastContribution: string | null;
  contributionCount: number;
  joinDate: string;
}

interface MemberContribution {
  id: number;
  amount: number;
  date: string;
  paymentMethod: string;
  note: string;
}

export default function Members() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const { data: members, isLoading } = useQuery({
    queryKey: ["/api/members"],
    queryFn: async () => {
      const response = await fetch("/api/members");
      if (!response.ok) throw new Error("Failed to fetch members");
      return response.json() as MemberSummary[];
    }
  });

  const { data: memberHistory } = useQuery({
    queryKey: ["/api/members", selectedMember?.id, "history", selectedYear],
    queryFn: async () => {
      if (!selectedMember) return [];
      const response = await fetch(`/api/members/${selectedMember.id}/history?year=${selectedYear}`);
      if (!response.ok) throw new Error("Failed to fetch member history");
      return response.json() as MemberContribution[];
    },
    enabled: !!selectedMember
  });

  const years = Array.from(
    { length: 5 }, 
    (_, i) => new Date().getFullYear() - i
  );

  const totalMembers = members?.length || 0;
  const totalContributions = members?.reduce((sum, member) => sum + member.totalContributions, 0) || 0;
  const averageContribution = totalMembers > 0 ? totalContributions / totalMembers : 0;

  const handleViewHistory = (member: MemberSummary) => {
    setSelectedMember(member);
    setHistoryDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IKILEN Members</h1>
          <p className="text-gray-600">Manage and view all investment group members and their contributions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Active investment group members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalContributions)}</div>
              <p className="text-xs text-muted-foreground">
                Combined member contributions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Contribution</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(averageContribution)}</div>
              <p className="text-xs text-muted-foreground">
                Per member average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Member Contributions</CardTitle>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Contributions</TableHead>
                  <TableHead>Contribution Count</TableHead>
                  <TableHead>Last Contribution</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.firstName} {member.lastName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{member.email}</TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(member.totalContributions)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {member.contributionCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      {member.lastContribution ? (
                        <span className="text-gray-600">
                          {formatDate(new Date(member.lastContribution))}
                        </span>
                      ) : (
                        <span className="text-gray-400">No contributions</span>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(new Date(member.joinDate))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewHistory(member)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View History</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Member History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedMember && (
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedMember.firstName.charAt(0)}{selectedMember.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{selectedMember.firstName} {selectedMember.lastName}</div>
                      <div className="text-sm text-gray-500 font-normal">
                        Contribution History for {selectedYear}
                      </div>
                    </div>
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {memberHistory && (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(memberHistory.reduce((sum, c) => sum + c.amount, 0))}
                      </div>
                      <p className="text-xs text-muted-foreground">Total for {selectedYear}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{memberHistory.length}</div>
                      <p className="text-xs text-muted-foreground">Contributions in {selectedYear}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {memberHistory.length > 0 
                          ? formatCurrency(memberHistory.reduce((sum, c) => sum + c.amount, 0) / memberHistory.length)
                          : formatCurrency(0)
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">Average contribution</p>
                    </CardContent>
                  </Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberHistory.map((contribution) => (
                      <TableRow key={contribution.id}>
                        <TableCell>{formatDate(new Date(contribution.date))}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(contribution.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                            {contribution.paymentMethod}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600">{contribution.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {memberHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No contributions found for {selectedYear}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}