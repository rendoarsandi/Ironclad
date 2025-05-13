"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Reply, Trash2, Edit, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  contract_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  user?: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
    };
  };
  replies?: Comment[];
}

interface CommentListProps {
  contractId: string;
  className?: string;
}

export function CommentList({ contractId, className = "" }: CommentListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      if (!contractId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            user:user_id (
              id,
              email,
              user_metadata
            )
          `)
          .eq('contract_id', contractId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Organize comments into threads
        const commentThreads = data.filter(comment => !comment.parent_id);
        const replies = data.filter(comment => comment.parent_id);

        // Add replies to their parent comments
        commentThreads.forEach(comment => {
          comment.replies = replies.filter(reply => reply.parent_id === comment.id);
        });

        setComments(commentThreads);
      } catch (error) {
        console.error('Error loading comments:', error);
        toast({
          title: "Error",
          description: "Gagal memuat komentar. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [contractId, toast]);

  // Add a new comment
  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          contract_id: contractId,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select(`
          *,
          user:user_id (
            id,
            email,
            user_metadata
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      // Add the new comment to the list
      data.replies = [];
      setComments([data, ...comments]);
      setNewComment("");

      toast({
        title: "Berhasil",
        description: "Komentar telah ditambahkan",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan komentar. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a reply to a comment
  const handleAddReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          contract_id: contractId,
          user_id: user.id,
          content: replyContent.trim(),
          parent_id: parentId,
        })
        .select(`
          *,
          user:user_id (
            id,
            email,
            user_metadata
          )
        `)
        .single();

      if (error) {
        throw error;
      }

      // Add the reply to the parent comment
      const updatedComments = comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), data],
          };
        }
        return comment;
      });

      setComments(updatedComments);
      setReplyToId(null);
      setReplyContent("");

      toast({
        title: "Berhasil",
        description: "Balasan telah ditambahkan",
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan balasan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        throw error;
      }

      if (isReply && parentId) {
        // Remove the reply from the parent comment
        const updatedComments = comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: (comment.replies || []).filter(reply => reply.id !== commentId),
            };
          }
          return comment;
        });
        setComments(updatedComments);
      } else {
        // Remove the comment from the list
        setComments(comments.filter(comment => comment.id !== commentId));
      }

      toast({
        title: "Berhasil",
        description: "Komentar telah dihapus",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus komentar. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  // Edit a comment
  const handleEditComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!user || !editContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .update({
          content: editContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (isReply && parentId) {
        // Update the reply in the parent comment
        const updatedComments = comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: (comment.replies || []).map(reply => 
                reply.id === commentId ? { ...reply, content: editContent.trim(), updated_at: data.updated_at } : reply
              ),
            };
          }
          return comment;
        });
        setComments(updatedComments);
      } else {
        // Update the comment in the list
        const updatedComments = comments.map(comment => 
          comment.id === commentId ? { ...comment, content: editContent.trim(), updated_at: data.updated_at } : comment
        );
        setComments(updatedComments);
      }

      setEditingId(null);
      setEditContent("");

      toast({
        title: "Berhasil",
        description: "Komentar telah diperbarui",
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui komentar. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  // Get user initials for avatar
  const getUserInitials = (comment: Comment) => {
    const name = comment.user?.user_metadata?.name || comment.user?.email || "";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: localeId });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Komentar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Tambahkan komentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
            disabled={!user || isSubmitting}
          />
          <Button
            onClick={handleAddComment}
            disabled={!user || !newComment.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
              </>
            ) : (
              "Kirim Komentar"
            )}
          </Button>
        </div>

        <Separator />

        {/* Comments list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-muted-foreground">Belum ada komentar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{getUserInitials(comment)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">
                          {comment.user?.user_metadata?.name || comment.user?.email || "Pengguna"}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDate(comment.created_at)}
                          {comment.created_at !== comment.updated_at && " (diedit)"}
                        </span>
                      </div>
                      {user && comment.user_id === user.id && (
                        <div className="flex gap-1">
                          {editingId === comment.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleEditComment(comment.id)}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingId(null);
                                  setEditContent("");
                                }}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingId(comment.id);
                                  setEditContent(comment.content);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Komentar</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus komentar ini? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editingId === comment.id ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[80px] mt-2"
                      />
                    ) : (
                      <p className="text-sm">{comment.content}</p>
                    )}
                    {user && editingId !== comment.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => {
                          setReplyToId(replyToId === comment.id ? null : comment.id);
                          setReplyContent("");
                        }}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Balas
                      </Button>
                    )}
                  </div>
                </div>

                {/* Reply form */}
                {replyToId === comment.id && (
                  <div className="ml-11 mt-2 space-y-2">
                    <Textarea
                      placeholder="Tulis balasan..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[80px]"
                      disabled={isSubmitting}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddReply(comment.id)}
                        disabled={!replyContent.trim() || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Mengirim...
                          </>
                        ) : (
                          "Kirim"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyToId(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={reply.user?.user_metadata?.avatar_url} />
                          <AvatarFallback>{getUserInitials(reply)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">
                                {reply.user?.user_metadata?.name || reply.user?.email || "Pengguna"}
                              </span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatDate(reply.created_at)}
                                {reply.created_at !== reply.updated_at && " (diedit)"}
                              </span>
                            </div>
                            {user && reply.user_id === user.id && (
                              <div className="flex gap-1">
                                {editingId === reply.id ? (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleEditComment(reply.id, true, comment.id)}
                                    >
                                      <Check className="h-3 w-3 text-green-500" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        setEditingId(null);
                                        setEditContent("");
                                      }}
                                    >
                                      <X className="h-3 w-3 text-red-500" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        setEditingId(reply.id);
                                        setEditContent(reply.content);
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                          <Trash2 className="h-3 w-3 text-red-500" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Hapus Balasan</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Apakah Anda yakin ingin menghapus balasan ini? Tindakan ini tidak dapat dibatalkan.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Batal</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                            className="bg-red-500 hover:bg-red-600"
                                          >
                                            Hapus
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          {editingId === reply.id ? (
                            <Textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="min-h-[60px] mt-2"
                            />
                          ) : (
                            <p className="text-sm">{reply.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
