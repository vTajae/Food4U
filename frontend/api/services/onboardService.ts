import UserRepository from "../repo/userRepository";


class OnboardService {
  private userRepository: UserRepository;

  constructor(env: Env) {
    this.userRepository = new UserRepository(env);
  }


}

export default OnboardService;
