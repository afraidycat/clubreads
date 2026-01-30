import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

interface Book {
  id: string
  title: string
  author: string
  page_count?: number
  created_at: string
}

interface ReadingHistoryProps {
  books: Book[]
}

export function ReadingHistory({ books }: ReadingHistoryProps) {
  if (books.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Reading History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {books.map((book, index) => (
            <div 
              key={book.id} 
              className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-medium text-sm">
                  {books.length - index}
                </div>
                <div>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">by {book.author}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-300">
                Finished
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}