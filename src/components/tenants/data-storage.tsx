import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

type DataStorageProps = {
  data: Record<string, any>;
};

export default function DataStorage({ data }: DataStorageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Database /> Data Store
        </CardTitle>
        <CardDescription>A view of your tenant's sample data in Firestore.</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="mt-2 h-[200px] w-full overflow-auto rounded-md bg-muted p-4 text-sm">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
