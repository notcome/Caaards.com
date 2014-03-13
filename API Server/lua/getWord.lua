-- getWord.lua (wordset, word) (word)

if redis.call('SISMEMBER', KEYS[1], ARGV[1]) == 0 then
  return false
end

return redis.call('GET', KEYS[2])
