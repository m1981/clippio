# Implementation Roadmap

## Phase 1: Service Layer (Next Sprint)
- [ ] Implement TaskSuggestionService interface
- [ ] Add factory pattern for service creation
- [ ] Add error/loading states to TaskInput
- [ ] Update TaskInput to use service instead of inline mock

## Phase 2: Database Integration (Following Sprint)
- [ ] Connect TodoStore to database
- [ ] Add persistence methods to store
- [ ] Implement data loading on app init
- [ ] Add optimistic updates with rollback

## Phase 3: Production AI (Future)
- [ ] Implement AnthropicTaskSuggestionService
- [ ] Add API key management
- [ ] Add rate limiting and caching
- [ ] Add fallback to mock service

## Phase 4: Enhanced UX (Future)
- [ ] Add task editing capabilities
- [ ] Implement drag-and-drop reordering
- [ ] Add task due dates and reminders
- [ ] Add project management features