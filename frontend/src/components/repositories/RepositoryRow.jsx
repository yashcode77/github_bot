import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  formatRepositoryDate,
  getRepositoryStatusLabel,
  getRepositoryStatusVariant,
  getRepositoryVisibilityLabel,
  getRepositoryVisibilityVariant,
} from "@/lib/repositories";
import { MoreHorizontal, Unplug } from "lucide-react";

export function RepositoryRow({ repository, onDisconnect }) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{repository.name}</div>
        <div className="text-xs text-muted-foreground">{repository.fullName}</div>
      </TableCell>
      <TableCell>{repository.owner}</TableCell>
      <TableCell>
        <Badge variant={getRepositoryVisibilityVariant(repository.isPrivate)}>
          {getRepositoryVisibilityLabel(repository.isPrivate)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={getRepositoryStatusVariant(repository.isActive)}>
          {getRepositoryStatusLabel(repository.isActive)}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatRepositoryDate(repository.connectedAt)}
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${repository.fullName}`}
              />
            }
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              disabled={!repository.isActive}
              onClick={() => onDisconnect(repository)}
            >
              <Unplug className="size-4" />
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
