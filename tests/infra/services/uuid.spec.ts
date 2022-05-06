import { UUIDService } from '@/infra/services';

function makeSut() {
  const sut = new UUIDService();

  return { sut };
}

describe(UUIDService.name, () => {
  test('Should return a valid v4 uuid', () => {
    const { sut } = makeSut();

    const sutResult = sut.generateUniqueID();

    expect(sutResult).toMatch(
      /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    );
  });
});
