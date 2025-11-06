interface SelectOption {
  label: string
  value: string
}

type RemoteRequest<T> = () => Promise<T>;
