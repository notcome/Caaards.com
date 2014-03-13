-- deleteWord.lua (wordset, quiz, word, star) (word)

if redis.call('EXISTS', KEYS[1]) == 0 then
  return false
end

redis.call('SREM', KEYS[1], ARGV[1])
redis.call('DEL', KEYS[4])
redis.call('ZREM', KEYS[2], ARGV[1])
redis.call('DEL', KEYS[3])

return true
