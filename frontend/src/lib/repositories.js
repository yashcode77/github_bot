import { formatDashboardDate } from "@/lib/dashboard";

export const REPOSITORY_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "connected", label: "Connected" },
  { value: "disconnected", label: "Disconnected" },
];

export function getRepositoryVisibilityLabel(isPrivate) {
  return isPrivate ? "Private" : "Public";
}

export function getRepositoryStatusLabel(isActive) {
  return isActive ? "Connected" : "Disconnected";
}

export function getRepositoryVisibilityVariant(isPrivate) {
  return isPrivate ? "secondary" : "outline";
}

export function getRepositoryStatusVariant(isActive) {
  return isActive ? "default" : "destructive";
}

export function formatRepositoryDate(value) {
  return formatDashboardDate(value);
}

export function filterRepositories(repositories, { search, statusFilter }) {
  const query = search.trim().toLowerCase();

  return repositories.filter((repository) => {
    const matchesSearch =
      !query ||
      repository.name.toLowerCase().includes(query) ||
      repository.fullName.toLowerCase().includes(query) ||
      repository.owner.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "connected" && repository.isActive) ||
      (statusFilter === "disconnected" && !repository.isActive);

    return matchesSearch && matchesStatus;
  });
}

export function isRepositoryConnected(connectedRepositories, githubRepoId) {
  return connectedRepositories.some(
    (repository) => repository.githubRepoId === githubRepoId && repository.isActive,
  );
}
